import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allocateCents, parseAmountToCents } from "@/lib/splitsmart";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const groupId = Number(body.groupId);
    const payerId = Number(body.payerId);
    const participantIds = Array.isArray(body.participantIds)
      ? body.participantIds.map((id: unknown) => Number(id)).filter(Number.isInteger)
      : [];
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!Number.isInteger(groupId) || groupId <= 0) {
      return NextResponse.json({ error: "Invalid group ID." }, { status: 400 });
    }
    if (!description) return NextResponse.json({ error: "Description is required." }, { status: 400 });

    let amountCents: number;
    try {
      amountCents = parseAmountToCents(String(body.amount ?? ""));
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid amount." }, { status: 400 });
    }

    if (!Number.isInteger(payerId) || payerId <= 0) {
      return NextResponse.json({ error: "Invalid payer member ID." }, { status: 400 });
    }
    if (participantIds.length === 0) {
      return NextResponse.json({ error: "Select at least one participant." }, { status: 400 });
    }
    if (new Set(participantIds).size !== participantIds.length) {
      return NextResponse.json({ error: "Each participant can be selected only once." }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group) return NextResponse.json({ error: "Group not found." }, { status: 404 });

    const memberIds = new Set(group.members.map((member) => member.id));
    if (!memberIds.has(payerId)) {
      return NextResponse.json({ error: "Payer must belong to the selected group." }, { status: 400 });
    }
    if (participantIds.some((memberId: number) => !memberIds.has(memberId))) {
      return NextResponse.json({ error: "All participants must belong to the selected group." }, { status: 400 });
    }

    const shares = allocateCents(amountCents, participantIds.length);
    const expense = await prisma.expense.create({
      data: {
        description,
        amountCents,
        payerId,
        groupId,
        participants: {
          create: participantIds.map((memberId: number, index: number) => ({
            memberId,
            shareCents: shares[index],
          })),
        },
      },
      include: {
        payer: true,
        participants: { include: { member: true }, orderBy: { memberId: "asc" } },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Expense amount")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to record the expense." }, { status: 500 });
  }
}
