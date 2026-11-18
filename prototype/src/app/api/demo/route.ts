import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { balancesForGroup, splitCents } from "@/lib/splits";

const groupInclude = {
  members: { include: { user: true } },
  expenses: { include: { payer: true, shares: { include: { user: true } } }, orderBy: { date: "desc" as const } },
  payments: { include: { fromUser: true, toUser: true }, orderBy: { date: "desc" as const } },
};

function present(group: Awaited<ReturnType<typeof prisma.group.findFirst>> & Record<string, unknown>) {
  if (!group) return null;
  const detailed = group as typeof group & { expenses: Array<{ date: Date; createdAt: Date; status: string; payerId: number; shares: Array<{ userId: number; amountCents: number }> }>; payments: Array<{ date: Date; createdAt: Date; fromUserId: number; toUserId: number; amountCents: number }> };
  return { ...detailed, balances: balancesForGroup(detailed), expenses: detailed.expenses.map((expense) => ({ ...expense, date: expense.date.toISOString(), createdAt: expense.createdAt.toISOString() })), payments: detailed.payments.map((payment) => ({ ...payment, date: payment.date.toISOString(), createdAt: payment.createdAt.toISOString() })) };
}

export async function GET() {
  const groups = await prisma.group.findMany({ include: groupInclude, orderBy: { id: "asc" } });
  return NextResponse.json({ groups: groups.map((group) => present(group)), demo: "Demo identity: Mia Chen. Authentication and notices are simulated for this prototype." });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "expense") return NextResponse.json({ group: await createExpense(body) });
    if (body.action === "review") return NextResponse.json({ group: await reviewExpense(body) });
    if (body.action === "payment") return NextResponse.json({ group: await createPayment(body) });
    return NextResponse.json({ error: "Unknown demo action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong." }, { status: 400 });
  }
}

async function getGroup(id: number) {
  const group = await prisma.group.findUnique({ where: { id }, include: groupInclude });
  if (!group) throw new Error("That group could not be found.");
  return group;
}

async function createExpense(body: Record<string, unknown>) {
  const groupId = Number(body.groupId); const amountCents = Math.round(Number(body.amount) * 100);
  const participantIds = Array.isArray(body.participantIds) ? body.participantIds.map(Number) : [];
  const payerId = Number(body.payerId); const splitMethod = body.splitMethod === "PERCENTAGE" ? "PERCENTAGE" : "EQUAL";
  const description = String(body.description ?? "").trim(); const date = new Date(String(body.date));
  if (!description || !Number.isFinite(amountCents) || amountCents <= 0 || Number.isNaN(date.getTime())) throw new Error("Enter a description, a positive amount, and a valid date.");
  if (!participantIds.length) throw new Error("Select at least one participant.");
  const group = await getGroup(groupId); const memberIds = new Set(group.members.map((member) => member.userId));
  if (!memberIds.has(payerId) || participantIds.some((id) => !memberIds.has(id))) throw new Error("Payer and participants must be group members.");
  const inputPercentages = Array.isArray(body.percentages) ? body.percentages.map(Number) : [];
  const percentages = splitMethod === "EQUAL" ? participantIds.map(() => 100 / participantIds.length) : inputPercentages;
  if (percentages.length !== participantIds.length || percentages.some((p) => !Number.isFinite(p) || p < 0) || (splitMethod === "PERCENTAGE" && Math.abs(percentages.reduce((a, b) => a + b, 0) - 100) > 0.00001)) throw new Error("Percentage splits must add up to exactly 100%.");
  const shares = splitCents(amountCents, percentages);
  await prisma.expense.create({ data: { groupId, description, amountCents, date, payerId, splitMethod, status: "PENDING", shares: { create: participantIds.map((userId, index) => ({ userId, amountCents: shares[index], percentage: splitMethod === "PERCENTAGE" ? Math.round(percentages[index] * 100) : null })) } } });
  return present(await getGroup(groupId));
}

async function reviewExpense(body: Record<string, unknown>) {
  const expenseId = Number(body.expenseId); const reviewerId = Number(body.reviewerId); const status = body.decision === "REJECTED" ? "REJECTED" : body.decision === "APPROVED" ? "APPROVED" : null;
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) throw new Error("That expense could not be found.");
  if (expense.status !== "PENDING") throw new Error("This expense has already been reviewed.");
  if (!status) throw new Error("Choose either approve or reject.");
  const reviewer = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: expense.groupId, userId: reviewerId } } });
  if (!reviewer || reviewer.role !== "owner") throw new Error("Only this group’s organizer can review pending expenses in the demo.");
  await prisma.expense.update({ where: { id: expenseId }, data: { status, reviewedById: reviewerId, reviewedAt: new Date() } });
  return present(await getGroup(expense.groupId));
}

async function createPayment(body: Record<string, unknown>) {
  const groupId = Number(body.groupId); const fromUserId = Number(body.fromUserId); const toUserId = Number(body.toUserId); const amountCents = Math.round(Number(body.amount) * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0 || fromUserId === toUserId) throw new Error("Enter a positive payment between two different people.");
  const group = await getGroup(groupId); const due = balancesForGroup(group).find((balance) => balance.fromUserId === fromUserId && balance.toUserId === toUserId)?.amountCents ?? 0;
  if (!due) throw new Error("There is no outstanding balance for that payment.");
  if (amountCents > due) throw new Error(`Payment exceeds the remaining ${formatCents(due)} due.`);
  await prisma.payment.create({ data: { groupId, fromUserId, toUserId, amountCents, date: new Date(String(body.date) || Date.now()), note: String(body.note ?? "").trim() || null } });
  return present(await getGroup(groupId));
}

function formatCents(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100); }
