import Link from "next/link";
import { getCurrentUser, getDemoUsers } from "@/lib/session";
import { getPendingApprovals } from "@/lib/data";
import { NavLinks } from "./NavLinks";
import { UserSwitcher } from "./UserSwitcher";

export async function SiteNav() {
  const [user, users] = await Promise.all([getCurrentUser(), getDemoUsers()]);
  const pending = user ? (await getPendingApprovals(user.id)).length : 0;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
          <Link href="/" className="text-lg font-bold text-indigo-700">
            SplitSmart
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            <NavLinks pendingCount={pending} />
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/expenses/new" className="btn-primary min-h-9!">
              + Add expense
            </Link>
            {user && <UserSwitcher users={users} currentId={user.id} />}
          </div>
        </div>
      </header>
      <nav
        aria-label="Main (mobile)"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white md:hidden"
      >
        <NavLinks pendingCount={pending} mobile />
      </nav>
    </>
  );
}
