import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const groupId = Number(id);
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!Number.isInteger(groupId) || groupId <= 0) {
      return NextResponse.json({ error: "Invalid group ID." }, { status: 400 });
    }
    if (!name) return NextResponse.json({ error: "Member name is required." }, { status: 400 });

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return NextResponse.json({ error: "Group not found." }, { status: 404 });

    const existing = await prisma.member.findFirst({ where: { groupId, name: { equals: name } } });
    if (existing) return NextResponse.json({ error: "That member is already in this group." }, { status: 409 });

    const member = await prisma.member.create({ data: { name, groupId } });
    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to add the member." }, { status: 500 });
  }
}
