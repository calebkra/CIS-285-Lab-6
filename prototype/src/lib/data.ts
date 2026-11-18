import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { computeDebts, netFor, type Debt } from "./balances";

export function parseDateInput(s: string | undefined | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : d;
}

export async function getGroupDebts(
  groupId: string,
  client: Prisma.TransactionClient | typeof db = db,
): Promise<Debt[]> {
  const [expenses, payments] = await Promise.all([
    client.expense.findMany({
      where: { groupId, status: "APPROVED" },
      include: { shares: true },
    }),
    client.payment.findMany({ where: { groupId } }),
  ]);
  return computeDebts(expenses, payments);
}

export async function getMembership(groupId: string, userId: string) {
  return db.membership.findUnique({ where: { groupId_userId: { groupId, userId } } });
}

export async function getUserGroups(userId: string) {
  const memberships = await db.membership.findMany({
    where: { userId },
    include: { group: { include: { members: { include: { user: true } } } } },
    orderBy: { group: { name: "asc" } },
  });
  return Promise.all(
    memberships.map(async (m) => {
      const debts = await getGroupDebts(m.groupId);
      const pending = await db.expense.count({ where: { groupId: m.groupId, status: "PENDING" } });
      return { membership: m, group: m.group, net: netFor(userId, debts), pending };
    }),
  );
}

const expenseInclude = {
  payer: true,
  submitter: true,
  decidedBy: true,
  group: true,
  approvals: { include: { reviewer: true }, orderBy: { createdAt: "asc" as const } },
  shares: { include: { user: true }, orderBy: { position: "asc" as const } },
};

/** Pending expenses this user is allowed to review (approver, not the submitter). */
export async function getPendingApprovals(userId: string) {
  return db.expense.findMany({
    where: {
      status: "PENDING",
      submitterId: { not: userId },
      approvals: { none: { reviewerId: userId } },
      group: { members: { some: { userId, canApprove: true } } },
    },
    include: expenseInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function getRecentActivity(userId: string, limit = 8) {
  const groupFilter = { group: { members: { some: { userId } } } };
  const [expenses, payments] = await Promise.all([
    db.expense.findMany({ where: groupFilter, include: expenseInclude, orderBy: { createdAt: "desc" }, take: limit }),
    db.payment.findMany({
      where: groupFilter,
      include: { from: true, to: true, group: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);
  const items = [
    ...expenses.map((e) => ({ kind: "expense" as const, at: e.createdAt, expense: e })),
    ...payments.map((p) => ({ kind: "payment" as const, at: p.createdAt, payment: p })),
  ];
  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

export async function getNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    include: { group: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

export async function getGroupDetail(groupId: string, userId: string) {
  if (!(await getMembership(groupId, userId))) return null;
  const group = await db.group.findUnique({
    where: { id: groupId },
    include: { members: { include: { user: true }, orderBy: { joinedAt: "asc" } } },
  });
  if (!group) return null;
  const [expenses, payments, debts] = await Promise.all([
    db.expense.findMany({
      where: { groupId },
      include: expenseInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    db.payment.findMany({
      where: { groupId },
      include: { from: true, to: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    getGroupDebts(groupId),
  ]);
  return { group, expenses, payments, debts };
}

export async function getExpenseDetail(expenseId: string, userId: string) {
  const expense = await db.expense.findUnique({ where: { id: expenseId }, include: expenseInclude });
  if (!expense || !(await getMembership(expense.groupId, userId))) return null;
  const me = await getMembership(expense.groupId, userId);
  const alreadyApproved = expense.approvals.some((a) => a.reviewerId === userId);
  return {
    expense,
    canReview:
      !!me?.canApprove && expense.submitterId !== userId && expense.status === "PENDING" && !alreadyApproved,
    alreadyApproved,
  };
}

export type ReportFilters = { groupId?: string; from: Date | null; to: Date | null };

export async function getReport(userId: string, f: ReportFilters) {
  const groupWhere = f.groupId
    ? { groupId: f.groupId, group: { members: { some: { userId } } } }
    : { group: { members: { some: { userId } } } };
  const dateWhere =
    f.from || f.to
      ? { date: { ...(f.from ? { gte: f.from } : {}), ...(f.to ? { lte: f.to } : {}) } }
      : {};
  const [expenses, payments] = await Promise.all([
    db.expense.findMany({
      where: { ...groupWhere, ...dateWhere },
      include: expenseInclude,
      orderBy: { date: "desc" },
    }),
    db.payment.findMany({
      where: { ...groupWhere, ...dateWhere },
      include: { from: true, to: true, group: true },
      orderBy: { date: "desc" },
    }),
  ]);
  const approved = expenses.filter((e) => e.status === "APPROVED");
  return {
    expenses,
    payments,
    totals: {
      approvedCents: approved.reduce((s, e) => s + e.amountCents, 0),
      approvedCount: approved.length,
      pendingCount: expenses.filter((e) => e.status === "PENDING").length,
      rejectedCount: expenses.filter((e) => e.status === "REJECTED").length,
      paymentsCents: payments.reduce((s, p) => s + p.amountCents, 0),
      yourShareCents: approved.reduce(
        (s, e) => s + (e.shares.find((x) => x.userId === userId)?.shareCents ?? 0),
        0,
      ),
    },
  };
}

/** Approvals needed for this expense: the group setting, capped by approvers who can actually review it. */
export async function requiredApprovalsFor(
  groupId: string,
  submitterId: string,
  client: Prisma.TransactionClient | typeof db = db,
): Promise<number> {
  const group = await client.group.findUnique({ where: { id: groupId } });
  const eligible = await client.membership.count({
    where: { groupId, canApprove: true, userId: { not: submitterId } },
  });
  return Math.max(1, Math.min(group?.requiredApprovals ?? 1, eligible));
}
