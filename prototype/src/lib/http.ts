import { NextResponse } from "next/server";
import { ApiError } from "./service";

export async function handle(fn: () => Promise<unknown>, status = 200) {
  try {
    return NextResponse.json(await fn(), { status });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    if (b && typeof b === "object" && !Array.isArray(b)) return b;
  } catch {}
  throw new ApiError(400, "Request body must be valid JSON.");
}
