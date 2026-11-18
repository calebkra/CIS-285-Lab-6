import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      members: { orderBy: { createdAt: "asc" } },
      expenses: {
        orderBy: { createdAt: "desc" },
        include: {
          payer: true,
          participants: { include: { member: true }, orderBy: { memberId: "asc" } },
        },
      },
    },
  });
  return NextResponse.json(groups);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return NextResponse.json({ error: "Group name is required." }, { status: 400 });

    const existing = await prisma.group.findFirst({ where: { name: { equals: name } } });
    if (existing) return NextResponse.json({ error: "A group with that name already exists." }, { status: 409 });

    const group = await prisma.group.create({
      data: { name },
      include: { members: true, expenses: true },
    });
    return NextResponse.json(group, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create the group." }, { status: 500 });
  }
}
