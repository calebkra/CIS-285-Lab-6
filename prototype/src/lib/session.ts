import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";

// PROTOTYPE ONLY: "sign in" is a plain cookie holding a demo user id.
// There are no passwords or sessions; do not use this pattern in production.
export const SESSION_COOKIE = "splitsmart_demo_user";

export async function getDemoUsers() {
  return db.user.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getCurrentUser() {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (id) {
    const user = await db.user.findUnique({ where: { id } });
    if (user) return user;
  }
  return (await db.user.findFirst({ orderBy: { createdAt: "asc" } })) ?? null;
}
