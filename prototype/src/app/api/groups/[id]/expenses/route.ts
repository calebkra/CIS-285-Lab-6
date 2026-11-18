import { handle, readBody } from "@/lib/http";
import { addExpense, listExpenses, parseId, requireGroup } from "@/lib/service";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const GET = (_: Request, { params }: Ctx) =>
  handle(async () => {
    const id = parseId((await params).id, "Group ID");
    await requireGroup(id);
    return listExpenses(id);
  });

export const POST = (req: Request, { params }: Ctx) =>
  handle(async () => addExpense(parseId((await params).id, "Group ID"), await readBody(req)), 201);
