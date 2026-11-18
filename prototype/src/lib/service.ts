import { prisma } from "./db";
import { computeBalances, splitShares } from "./balances";
import { parseDollarsToCents } from "./money";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function parseId(v: unknown, label: string): number {
  const n = typeof v === "string" && /^\d+$/.test(v) ? Number(v) : typeof v === "number" ? v : NaN;
  if (!Number.isSafeInteger(n) || n <= 0) throw new ApiError(400, `${label} must be a positive whole number.`);
  return n;
}

export function cleanName(v: unknown, label: string): string {
  if (typeof v !== "string" || !v.trim()) throw new ApiError(400, `${label} is required.`);
  const s = v.trim();
  if (s.length > 100) throw new ApiError(400, `${label} must be 100 characters or fewer.`);
  return s;
}

export async function requireGroup(id: number) {
  const g = await prisma.group.findUnique({ where: { id } });
  if (!g) throw new ApiError(404, "Group not found.");
  return g;
}

export async function addExpense(groupId: number, body: Record<string, unknown>) {
  await requireGroup(groupId);
  const description = cleanName(body.description, "Description");
  const amountCents = parseDollarsToCents(body.amount);
  if (amountCents === null) throw new ApiError(400, "Amount must be a number with at most 2 decimal places (e.g. 12.50).");
  if (amountCents <= 0) throw new ApiError(400, "Amount must be greater than zero.");
  const payerId = parseId(body.payerId, "Payer");
  if (!Array.isArray(body.participantIds) || body.participantIds.length === 0)
    throw new ApiError(400, "Select at least one participant.");
  const participantIds = [...new Set(body.participantIds.map((p) => parseId(p, "Participant ID")))];

  const members = await prisma.member.findMany({ where: { groupId }, select: { id: true } });
  const valid = new Set(members.map((m) => m.id));
  if (!valid.has(payerId)) throw new ApiError(400, "Payer must be a member of this group.");
  const bad = participantIds.filter((id) => !valid.has(id));
  if (bad.length) throw new ApiError(400, `Participant ID(s) ${bad.join(", ")} are not members of this group.`);

  return prisma.expense.create({
    data: {
      description,
      amountCents,
      groupId,
      payerId,
      participants: { create: participantIds.map((memberId) => ({ memberId })) },
    },
  });
}

export async function getBalances(groupId: number) {
  const members = await prisma.member.findMany({ where: { groupId }, orderBy: { id: "asc" } });
  const expenses = await prisma.expense.findMany({ where: { groupId }, include: { participants: true } });
  const bal = computeBalances(
    members.map((m) => m.id),
    expenses.map((e) => ({
      amountCents: e.amountCents,
      payerId: e.payerId,
      participantIds: e.participants.map((p) => p.memberId),
    })),
  );
  return members.map((m) => ({ memberId: m.id, name: m.name, balanceCents: bal.get(m.id) ?? 0 }));
}

export async function listExpenses(groupId: number) {
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    orderBy: { id: "desc" },
    include: { payer: true, participants: { include: { member: true } } },
  });
  return expenses.map((e) => {
    const shares = splitShares(e.amountCents, e.participants.map((p) => p.memberId));
    return {
      id: e.id,
      description: e.description,
      amountCents: e.amountCents,
      payer: e.payer.name,
      createdAt: e.createdAt,
      participants: e.participants
        .map((p) => ({ memberId: p.memberId, name: p.member.name, shareCents: shares.get(p.memberId) ?? 0 }))
        .sort((a, b) => a.memberId - b.memberId),
    };
  });
}
