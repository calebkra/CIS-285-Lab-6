"use client";

import { usePathname } from "next/navigation";
import { switchUser } from "@/app/actions";

export function UserSwitcher({
  users,
  currentId,
}: {
  users: { id: string; name: string }[];
  currentId: string;
}) {
  const path = usePathname();
  return (
    <form action={switchUser} className="flex items-center gap-2">
      <input type="hidden" name="returnTo" value={path} />
      <label htmlFor="demo-user" className="text-xs text-slate-600">
        Demo user
      </label>
      <select
        id="demo-user"
        name="userId"
        defaultValue={currentId}
        className="field min-h-9! w-auto! py-1!"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <noscript>
        <button className="btn-secondary">Switch</button>
      </noscript>
    </form>
  );
}
