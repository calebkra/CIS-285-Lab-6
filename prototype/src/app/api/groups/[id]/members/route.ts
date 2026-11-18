import { prisma } from "@/lib/db";
import { handle, readBody } from "@/lib/http";
import { cleanName, parseId, requireGroup } from "@/lib/service";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const GET = (_: Request, { params }: Ctx) =>
  handle(async () => {
    const id = parseId((await params).id, "Group ID");
    await requireGroup(id);
    return prisma.member.findMany({ where: { groupId: id }, orderBy: { id: "asc" } });
  });

export const POST = (req: Request, { params }: Ctx) =>
  handle(async () => {
    const id = parseId((await params).id, "Group ID");
    await requireGroup(id);
    const name = cleanName((await readBody(req)).name, "Member name");
    return prisma.member.create({ data: { name, groupId: id } });
  }, 201);
