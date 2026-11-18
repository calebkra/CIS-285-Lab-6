/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = [
    ["Mia Chen", "mia@example.test"], ["Noah Williams", "noah@example.test"], ["Ava Patel", "ava@example.test"], ["Leo Martin", "leo@example.test"],
  ];
  for (const [name, email] of users) await prisma.user.upsert({ where: { email }, update: { name }, create: { name, email } });
  const people = await prisma.user.findMany({ orderBy: { id: "asc" } });
  const trip = await prisma.group.upsert({ where: { id: 1 }, update: { name: "Lisbon getaway", emoji: "☀️", color: "orange" }, create: { id: 1, name: "Lisbon getaway", emoji: "☀️", color: "orange" } });
  const home = await prisma.group.upsert({ where: { id: 2 }, update: { name: "Apartment 4B", emoji: "🏠", color: "violet" }, create: { id: 2, name: "Apartment 4B", emoji: "🏠", color: "violet" } });
  for (const [index, user] of people.entries()) { await prisma.groupMember.upsert({ where: { groupId_userId: { groupId: trip.id, userId: user.id } }, update: {}, create: { groupId: trip.id, userId: user.id, role: index === 0 ? "owner" : "member" } }); }
  for (const [index, user] of people.slice(0, 3).entries()) { await prisma.groupMember.upsert({ where: { groupId_userId: { groupId: home.id, userId: user.id } }, update: {}, create: { groupId: home.id, userId: user.id, role: index === 0 ? "owner" : "member" } }); }
  if (!await prisma.expense.count()) {
    const dinner = await prisma.expense.create({ data: { groupId: trip.id, description: "Welcome dinner", amountCents: 18450, date: new Date("2026-10-12"), payerId: people[0].id, splitMethod: "EQUAL", status: "APPROVED" } });
    await prisma.expenseShare.createMany({ data: people.map((user, i) => ({ expenseId: dinner.id, userId: user.id, amountCents: i === 0 ? 4614 : 4612 })) });
    const museum = await prisma.expense.create({ data: { groupId: trip.id, description: "Museum passes", amountCents: 7200, date: new Date("2026-10-14"), payerId: people[2].id, splitMethod: "EQUAL", status: "APPROVED" } });
    await prisma.expenseShare.createMany({ data: people.map((user) => ({ expenseId: museum.id, userId: user.id, amountCents: 1800 })) });
    const taxi = await prisma.expense.create({ data: { groupId: trip.id, description: "Airport taxi", amountCents: 4860, date: new Date("2026-10-16"), payerId: people[1].id, splitMethod: "EQUAL", status: "PENDING" } });
    await prisma.expenseShare.createMany({ data: people.slice(0, 3).map((user) => ({ expenseId: taxi.id, userId: user.id, amountCents: 1620 })) });
    const utilities = await prisma.expense.create({ data: { groupId: home.id, description: "October utilities", amountCents: 13240, date: new Date("2026-10-01"), payerId: people[1].id, splitMethod: "PERCENTAGE", status: "APPROVED" } });
    await prisma.expenseShare.createMany({ data: [{ expenseId: utilities.id, userId: people[0].id, amountCents: 3972, percentage: 3000 }, { expenseId: utilities.id, userId: people[1].id, amountCents: 5296, percentage: 4000 }, { expenseId: utilities.id, userId: people[2].id, amountCents: 3972, percentage: 3000 }] });
    await prisma.payment.create({ data: { groupId: trip.id, fromUserId: people[3].id, toUserId: people[0].id, amountCents: 2000, date: new Date("2026-10-18"), note: "Dinner share" } });
  }
  console.log("SplitSmart demo data is ready.");
}
main().finally(() => prisma.$disconnect());
