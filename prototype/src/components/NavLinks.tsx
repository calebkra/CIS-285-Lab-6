"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/groups", label: "Groups" },
  { href: "/approvals", label: "Approvals" },
  { href: "/reports", label: "Reports" },
];

export function NavLinks({ pendingCount, mobile }: { pendingCount: number; mobile?: boolean }) {
  const path = usePathname();
  return (
    <>
      {LINKS.map((l) => {
        const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={
              mobile
                ? `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${active ? "text-indigo-700" : "text-slate-600"}`
                : `rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-100"}`
            }
          >
            <span>
              {l.label}
              {l.href === "/approvals" && pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </>
  );
}
