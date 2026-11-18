import { handle } from "@/lib/http";
import { getBalances, parseId, requireGroup } from "@/lib/service";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const GET = (_: Request, { params }: Ctx) =>
  handle(async () => {
    const id = parseId((await params).id, "Group ID");
    await requireGroup(id);
    return getBalances(id);
  });
