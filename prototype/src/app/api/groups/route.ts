import { prisma } from "@/lib/db";
import { handle, readBody } from "@/lib/http";
import { cleanName } from "@/lib/service";

export const dynamic = "force-dynamic";

export const GET = () => handle(() => prisma.group.findMany({ orderBy: { id: "asc" } }));

export const POST = (req: Request) =>
  handle(async () => {
    const body = await readBody(req);
    return prisma.group.create({ data: { name: cleanName(body.name, "Group name") } });
  }, 201);
