/**
 * Idempotent demo seed. Run with: npm run db:seed
 *
 * Every record has a fixed id/email and is only created when missing, so running
 * this repeatedly never duplicates rows and never overwrites changes made in the
 * app. It never deletes anything.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Same largest-remainder rule as src/lib/money.ts (kept inline so the seed is standalone).
function splitBp(total: number, bps: number[]): number[] {
  const exact = bps.map((bp) => total * bp);
  const shares = exact.map((e) => Math.floor(e / 10000));
  let left = total - shares.reduce((a, b) => a + b, 0);
  const order = bps
    .map((_, i) => ({ i, rem: exact[i] % 10000 }))
    .sort((a, b) => b.rem - a.rem || a.i - b.i);
  for (let k = 0; left > 0 && k < order.length; k++, left--) shares[order[k].i] += 1;
  return shares;
}

const DAY = 86_400_000;
function daysAgo(n: number): Date {
  const d = new Date(Date.now() - n * DAY);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const USERS = [
  { id: "u-alex", name: "Alex Rivera", email: "alex@example.com" },
  { id: "u-jordan", name: "Jordan Lee", email: "jordan@example.com" },
  { id: "u-sam", name: "Sam Patel", email: "sam@example.com" },
  { id: "u-riley", name: "Riley Chen", email: "riley@example.com" },
];

const GROUPS = [
  {
    id: "g-roommates",
    name: "Maple St. Roommates",
    description: "Rent, utilities and groceries for the apartment.",
    members: [
      ["u-alex", true, true],
      ["u-jordan", false, true],
      ["u-sam", false, false],
      ["u-riley", false, false],
    ],
  },
  {
    id: "g-lisbon",
    name: "Lisbon Trip",
    description: "Shared costs for the spring trip.",
    members: [
      ["u-alex", true, true],
      ["u-jordan", false, true],
      ["u-sam", false, false],
    ],
  },
] as const;

type Status = "PENDING" | "APPROVED" | "REJECTED";
type Seed = {
  id: string;
  group: string;
  description: string;
  cents: number;
  ago: number;
  payer: string;
  submitter: string;
  status: Status;
  // participants in selection order; `pct` (basis points) makes it a percentage split
  people: { user: string; pct?: number }[];
  decidedBy?: string;
  note?: string;
};

const eq = (...u: string[]) => u.map((user) => ({ user }));

const EXPENSES: Seed[] = [
  { id: "e-rent", group: "g-roommates", description: "November rent", cents: 240000, ago: 14, payer: "u-alex", submitter: "u-alex", status: "APPROVED", people: eq("u-alex", "u-jordan", "u-sam", "u-riley"), decidedBy: "u-jordan" },
  { id: "e-groceries", group: "g-roommates", description: "Weekly groceries", cents: 8743, ago: 9, payer: "u-jordan", submitter: "u-jordan", status: "APPROVED", people: eq("u-alex", "u-jordan", "u-sam", "u-riley"), decidedBy: "u-alex" },
  { id: "e-internet", group: "g-roommates", description: "Internet bill", cents: 6000, ago: 6, payer: "u-sam", submitter: "u-sam", status: "APPROVED", people: eq("u-alex", "u-jordan", "u-sam", "u-riley"), decidedBy: "u-alex" },
  { id: "e-utilities", group: "g-roommates", description: "Electric & gas", cents: 13420, ago: 2, payer: "u-riley", submitter: "u-riley", status: "PENDING", people: [{ user: "u-alex", pct: 4000 }, { user: "u-jordan", pct: 3000 }, { user: "u-sam", pct: 2000 }, { user: "u-riley", pct: 1000 }] },
  { id: "e-pizza", group: "g-roommates", description: "Pizza night", cents: 5280, ago: 1, payer: "u-sam", submitter: "u-sam", status: "PENDING", people: eq("u-alex", "u-sam", "u-riley") },
  { id: "e-cleaning", group: "g-roommates", description: "Cleaning supplies", cents: 2315, ago: 5, payer: "u-alex", submitter: "u-riley", status: "REJECTED", people: eq("u-alex", "u-jordan", "u-sam", "u-riley"), decidedBy: "u-jordan", note: "Duplicate of last week's receipt." },
  { id: "e-hotel", group: "g-lisbon", description: "Hotel (3 nights)", cents: 48000, ago: 20, payer: "u-jordan", submitter: "u-jordan", status: "APPROVED", people: eq("u-alex", "u-jordan", "u-sam"), decidedBy: "u-alex" },
  { id: "e-train", group: "g-lisbon", description: "Train tickets", cents: 9650, ago: 18, payer: "u-alex", submitter: "u-alex", status: "APPROVED", people: eq("u-alex", "u-jordan", "u-sam"), decidedBy: "u-jordan" },
  { id: "e-dinner", group: "g-lisbon", description: "Group dinner", cents: 11800, ago: 3, payer: "u-sam", submitter: "u-sam", status: "PENDING", people: [{ user: "u-alex", pct: 4000 }, { user: "u-jordan", pct: 3000 }, { user: "u-sam", pct: 3000 }] },
  // Payer (Sam) is NOT a participant: Alex and Jordan owe Sam their shares once approved.
  { id: "e-taxi", group: "g-lisbon", description: "Airport taxi (Sam paid, not sharing)", cents: 6000, ago: 1, payer: "u-sam", submitter: "u-sam", status: "PENDING", people: eq("u-alex", "u-jordan") },
];

const PAYMENTS = [
  { id: "p-1", group: "g-roommates", from: "u-sam", to: "u-alex", cents: 15000, ago: 4, note: "Part of rent share" },
  { id: "p-2", group: "g-roommates", from: "u-riley", to: "u-alex", cents: 30000, ago: 3, note: "Rent" },
  { id: "p-3", group: "g-lisbon", from: "u-sam", to: "u-jordan", cents: 10000, ago: 7, note: "Hotel deposit" },
];

async function main() {
  let created = 0;

  for (const u of USERS) {
    const found = await prisma.user.findUnique({ where: { id: u.id } });
    if (!found && !(await prisma.user.findUnique({ where: { email: u.email } }))) {
      await prisma.user.create({ data: u });
      created++;
    }
  }

  for (const g of GROUPS) {
    if (!(await prisma.group.findUnique({ where: { id: g.id } }))) {
      await prisma.group.create({ data: { id: g.id, name: g.name, description: g.description } });
      created++;
    }
    for (const [userId, isOrganizer, canApprove] of g.members) {
      const exists = await prisma.membership.findUnique({
        where: { groupId_userId: { groupId: g.id, userId } },
      });
      if (!exists) {
        await prisma.membership.create({ data: { groupId: g.id, userId, isOrganizer, canApprove } });
        created++;
      }
    }
  }

  // Demo: Lisbon Trip needs two approvals (only bumped while still at the default of 1).
  await prisma.group.updateMany({ where: { id: "g-lisbon", requiredApprovals: 1 }, data: { requiredApprovals: 2 } });

  for (const e of EXPENSES) {
    if (await prisma.expense.findUnique({ where: { id: e.id } })) continue;
    const bps = e.people.every((p) => p.pct != null)
      ? e.people.map((p) => p.pct as number)
      : (() => {
          const base = Math.floor(10000 / e.people.length);
          const arr = e.people.map(() => base);
          arr[0] += 10000 - base * e.people.length;
          return arr;
        })();
    const isPercent = e.people.every((p) => p.pct != null);
    // Equal split: exact cents (first participants absorb remainder), like the app.
    const shares = isPercent
      ? splitBp(e.cents, bps)
      : e.people.map((_, i) => Math.floor(e.cents / e.people.length) + (i < e.cents % e.people.length ? 1 : 0));
    const decided = e.status !== "PENDING";
    await prisma.expense.create({
      data: {
        id: e.id,
        groupId: e.group,
        description: e.description,
        amountCents: e.cents,
        date: daysAgo(e.ago),
        payerId: e.payer,
        submitterId: e.submitter,
        splitMethod: isPercent ? "PERCENT" : "EQUAL",
        status: e.status,
        decisionNote: e.note ?? null,
        decidedById: decided ? e.decidedBy : null,
        decidedAt: decided ? daysAgo(Math.max(e.ago - 1, 0)) : null,
        createdAt: daysAgo(e.ago),
        shares: {
          create: e.people.map((p, i) => ({
            userId: p.user,
            shareCents: shares[i],
            percentBp: isPercent ? bps[i] : null,
            position: i,
          })),
        },
      },
    });
    created++;

    if (e.status === "PENDING") {
      const members = await prisma.membership.findMany({ where: { groupId: e.group } });
      const submitter = USERS.find((u) => u.id === e.submitter)!;
      for (const m of members.filter((m) => m.userId !== e.submitter)) {
        await prisma.notification.create({
          data: {
            userId: m.userId,
            groupId: e.group,
            expenseId: e.id,
            message: `${submitter.name} submitted “${e.description}” for review.`,
            createdAt: daysAgo(e.ago),
          },
        });
      }
    }
  }

  // Approval records: one per approved seed expense, plus Alex's first approval of the
  // Lisbon dinner (needs 2) so the multi-approval flow can be demoed. Only added while missing.
  const approvalSeeds = [
    ...EXPENSES.filter((e) => e.status === "APPROVED" && e.decidedBy).map((e) => ({ expenseId: e.id, reviewerId: e.decidedBy!, ago: Math.max(e.ago - 1, 0) })),
    { expenseId: "e-dinner", reviewerId: "u-alex", ago: 2 },
    { expenseId: "e-taxi", reviewerId: "u-jordan", ago: 1 },
  ];
  for (const a of approvalSeeds) {
    const exp = await prisma.expense.findUnique({ where: { id: a.expenseId } });
    if (!exp || (["e-dinner", "e-taxi"].includes(a.expenseId) && exp.status !== "PENDING")) continue;
    const key = { expenseId_reviewerId: { expenseId: a.expenseId, reviewerId: a.reviewerId } };
    if (!(await prisma.approval.findUnique({ where: key }))) {
      await prisma.approval.create({ data: { expenseId: a.expenseId, reviewerId: a.reviewerId, createdAt: daysAgo(a.ago) } });
      created++;
    }
  }

  for (const p of PAYMENTS) {
    if (await prisma.payment.findUnique({ where: { id: p.id } })) continue;
    await prisma.payment.create({
      data: { id: p.id, groupId: p.group, fromUserId: p.from, toUserId: p.to, amountCents: p.cents, date: daysAgo(p.ago), note: p.note },
    });
    created++;
  }

  console.log(created ? `Seed complete: created ${created} new records.` : "Seed already applied: nothing to create.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
