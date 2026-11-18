"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser, SESSION_COOKIE } from "@/lib/session";
import { getGroupDebts, getMembership, parseDateInput, requiredApprovalsFor } from "@/lib/data";
import { outstanding } from "@/lib/balances";
import {
  formatCents,
  parseAmountToCents,
  parsePercentToBp,
  splitByBasisPoints,
  splitEqual,
} from "@/lib/money";

export type FormState = { errors?: Record<string, string>; message?: string };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function go(path: string, kind: "notice" | "error", text: string): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${kind}=${encodeURIComponent(text)}`);
}

/** PROTOTYPE: switch the demo user (no authentication). */
export async function switchUser(formData: FormData) {
  const id = str(formData, "userId");
  const user = await db.user.findUnique({ where: { id } });
  if (user) (await cookies()).set(SESSION_COOKIE, user.id, { path: "/", httpOnly: true, sameSite: "lax" });
  revalidatePath("/", "layout");
  // Stay on list pages; detail pages may be inaccessible to the new user, so go home.
  const back = str(formData, "returnTo");
  redirect(["/", "/groups", "/approvals", "/reports"].includes(back) ? back : "/");
}

export async function createExpense(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "No demo user found. Run the seed script first." };

  const groupId = str(fd, "groupId");
  if (!(await getMembership(groupId, user.id))) return { message: "You are not a member of this group." };

  const members = await db.membership.findMany({ where: { groupId }, orderBy: { joinedAt: "asc" } });
  const memberIds = new Set(members.map((m) => m.userId));

  const errors: Record<string, string> = {};
  const description = str(fd, "description");
  if (!description) errors.description = "Enter a description.";
  else if (description.length > 120) errors.description = "Keep the description under 120 characters.";

  const amountCents = parseAmountToCents(str(fd, "amount"));
  if (amountCents === null) errors.amount = "Enter a valid amount, e.g. 42.50 (max 2 decimals).";
  else if (amountCents <= 0) errors.amount = "Amount must be greater than $0.00.";

  const date = parseDateInput(str(fd, "date"));
  if (!date) errors.date = "Choose a valid date.";

  const payerId = str(fd, "payerId");
  if (!memberIds.has(payerId)) errors.payerId = "Choose a payer who is a group member.";

  const selected = fd.getAll("participants").map(String);
  // keep group membership order so remainder cents are assigned deterministically
  const participants = members.map((m) => m.userId).filter((id) => selected.includes(id));
  if (participants.length === 0) errors.participants = "Select at least one participant.";

  const splitMethod = str(fd, "splitMethod") === "PERCENT" ? "PERCENT" : "EQUAL";
  let bps: number[] = [];
  if (splitMethod === "PERCENT" && participants.length) {
    bps = participants.map((id) => parsePercentToBp(str(fd, `pct_${id}`)) ?? -1);
    if (bps.some((b) => b < 0)) errors.split = "Enter a valid percentage (max 2 decimals) for every participant.";
    else if (bps.reduce((a, b) => a + b, 0) !== 10000) errors.split = "Percentages must total exactly 100%.";
  }

  if (Object.keys(errors).length || amountCents === null || !date) {
    return { errors, message: "Please fix the highlighted fields." };
  }

  const shares =
    splitMethod === "PERCENT"
      ? splitByBasisPoints(amountCents, bps)
      : splitEqual(amountCents, participants.length);

  const expense = await db.expense.create({
    data: {
      groupId,
      description,
      amountCents,
      date,
      payerId,
      submitterId: user.id,
      splitMethod,
      status: "PENDING",
      shares: {
        create: participants.map((userId, i) => ({
          userId,
          shareCents: shares[i],
          percentBp: splitMethod === "PERCENT" ? bps[i] : null,
          position: i,
        })),
      },
    },
  });

  // PROTOTYPE: in-app notices only; nothing is emailed or pushed.
  await db.notification.createMany({
    data: members
      .filter((m) => m.userId !== user.id)
      .map((m) => ({
        userId: m.userId,
        groupId,
        expenseId: expense.id,
        message: `${user.name} submitted “${description}” (${formatCents(amountCents)}) for review.`,
      })),
  });

  revalidatePath("/", "layout");
  go(`/groups/${groupId}`, "notice", "Expense submitted. It is pending approval and does not affect balances yet.");
}

export async function reviewExpense(fd: FormData) {
  const user = await getCurrentUser();
  const expenseId = str(fd, "expenseId");
  const returnTo = str(fd, "returnTo").startsWith("/") ? str(fd, "returnTo") : "/approvals";
  if (!user) go(returnTo, "error", "No demo user found.");

  const reject = str(fd, "decision") === "reject";
  const note = str(fd, "note").slice(0, 300);

  const expense = await db.expense.findUnique({ where: { id: expenseId } });
  if (!expense) go(returnTo, "error", "That expense no longer exists.");
  const me = await getMembership(expense.groupId, user.id);
  if (!me?.canApprove) go(returnTo, "error", "You are not an approver for this group.");
  if (expense.submitterId === user.id) go(returnTo, "error", "You cannot review your own expense.");
  if (reject && !note) go(returnTo, "error", "Add a short reason when rejecting an expense.");

  // Everything happens in one transaction so concurrent reviewers can't double-decide.
  const result = await db.$transaction(async (tx) => {
    const current = await tx.expense.findUnique({ where: { id: expenseId } });
    if (!current || current.status !== "PENDING") return { error: "This expense was already reviewed." };

    if (reject) {
      await tx.expense.update({
        where: { id: expenseId },
        data: { status: "REJECTED", decidedById: user.id, decidedAt: new Date(), decisionNote: note },
      });
      return { status: "REJECTED" as const, have: 0, need: 0 };
    }

    if (await tx.approval.findUnique({ where: { expenseId_reviewerId: { expenseId, reviewerId: user.id } } })) {
      return { error: "You have already approved this expense." };
    }
    await tx.approval.create({ data: { expenseId, reviewerId: user.id, note: note || null } });
    const need = await requiredApprovalsFor(expense.groupId, expense.submitterId, tx);
    const have = await tx.approval.count({ where: { expenseId } });
    if (have >= need) {
      await tx.expense.update({
        where: { id: expenseId },
        data: { status: "APPROVED", decidedById: user.id, decidedAt: new Date(), decisionNote: note || null },
      });
      return { status: "APPROVED" as const, have, need };
    }
    return { status: "PENDING" as const, have, need };
  });

  if ("error" in result) go(returnTo, "error", result.error ?? "Could not review expense.");

  const verb = result.status === "REJECTED" ? "rejected" : "approved";
  const progress = result.status === "PENDING" ? ` (${result.have} of ${result.need} approvals)` : "";
  await db.notification.create({
    data: {
      userId: expense.submitterId,
      groupId: expense.groupId,
      expenseId,
      message: `${user.name} ${verb} “${expense.description}”${progress}.${note ? ` Note: ${note}` : ""}`,
    },
  });

  revalidatePath("/", "layout");
  go(
    returnTo,
    "notice",
    result.status === "APPROVED"
      ? "Expense approved. Balances updated."
      : result.status === "REJECTED"
        ? "Expense rejected. Balances unchanged."
        : `Approval recorded (${result.have} of ${result.need}). Still pending; balances unchanged.`,
  );
}

/** Organizer-only: set how many approvals an expense needs. */
export async function updateApprovalPolicy(fd: FormData) {
  const user = await getCurrentUser();
  const groupId = str(fd, "groupId");
  const back = `/groups/${groupId}`;
  if (!user) go(back, "error", "No demo user found.");
  const me = await getMembership(groupId, user.id);
  if (!me?.isOrganizer) go(back, "error", "Only the group organizer can change approval settings.");

  const approvers = await db.membership.count({ where: { groupId, canApprove: true } });
  const n = Number(str(fd, "requiredApprovals"));
  if (!Number.isInteger(n) || n < 1 || n > approvers) {
    go(back, "error", `Choose a number from 1 to ${approvers} (the number of approvers in this group).`);
  }

  await db.group.update({ where: { id: groupId }, data: { requiredApprovals: n } });

  // Pending expenses that already meet the new threshold are approved now.
  const pending = await db.expense.findMany({
    where: { groupId, status: "PENDING" },
    include: { _count: { select: { approvals: true } } },
  });
  let settled = 0;
  for (const e of pending) {
    const need = await requiredApprovalsFor(groupId, e.submitterId);
    if (e._count.approvals >= need) {
      const r = await db.expense.updateMany({
        where: { id: e.id, status: "PENDING" },
        data: { status: "APPROVED", decidedById: user.id, decidedAt: new Date() },
      });
      settled += r.count;
    }
  }

  revalidatePath("/", "layout");
  go(back, "notice", `Approvals required set to ${n}.${settled ? ` ${settled} pending expense(s) now meet it and were approved.` : ""}`);
}

export async function recordPayment(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "No demo user found. Run the seed script first." };

  const groupId = str(fd, "groupId");
  if (!(await getMembership(groupId, user.id))) return { message: "You are not a member of this group." };

  const fromId = str(fd, "fromId");
  const toId = str(fd, "toId");
  const errors: Record<string, string> = {};

  const [fromM, toM] = await Promise.all([getMembership(groupId, fromId), getMembership(groupId, toId)]);
  if (!fromM) errors.fromId = "Choose who is paying.";
  if (!toM) errors.toId = "Choose who is being paid.";
  if (fromM && toM && fromId === toId) errors.toId = "Payer and recipient must be different people.";
  if (fromM && toM && user.id !== fromId && user.id !== toId) {
    errors.fromId = "You can only record payments you made or received.";
  }

  const amountCents = parseAmountToCents(str(fd, "amount"));
  if (amountCents === null) errors.amount = "Enter a valid amount, e.g. 25.00.";
  else if (amountCents <= 0) errors.amount = "Amount must be greater than $0.00.";

  const date = parseDateInput(str(fd, "date"));
  if (!date) errors.date = "Choose a valid date.";

  if (Object.keys(errors).length || amountCents === null || !date) {
    return { errors, message: "Payment not recorded." };
  }

  // Check the outstanding amount and insert in one transaction (no overpayment races).
  const failure = await db.$transaction(async (tx) => {
    const due = outstanding(await getGroupDebts(groupId, tx), fromId, toId);
    if (due === 0) return "No balance is currently owed from this person to that person.";
    if (amountCents > due) return `That is more than the ${formatCents(due)} currently owed. Enter ${formatCents(due)} or less.`;
    await tx.payment.create({
      data: { groupId, fromUserId: fromId, toUserId: toId, amountCents, date, note: str(fd, "note").slice(0, 200) },
    });
    return null;
  });
  if (failure) return { errors: { amount: failure }, message: "Payment not recorded." };

  revalidatePath("/", "layout");
  go(`/groups/${groupId}`, "notice", `Payment of ${formatCents(amountCents)} recorded (prototype: no money was moved).`);
}

export async function markNotificationsRead() {
  const user = await getCurrentUser();
  if (user) await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/", "layout");
}
