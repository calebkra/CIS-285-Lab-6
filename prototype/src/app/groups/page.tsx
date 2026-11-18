import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getUserGroups } from "@/lib/data";
import { Balance, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const user = await getCurrentUser();
  const groups = user ? await getUserGroups(user.id) : [];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Groups</h1>
      {groups.length === 0 ? (
        <Empty title="No groups yet">Run <code>npm run db:seed</code> to load demo groups.</Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map(({ group, membership, net, pending }) => (
            <Link key={group.id} href={`/groups/${group.id}`} className="card block hover:border-indigo-300">
              <h2 className="font-semibold">{group.name}</h2>
              <p className="muted">{group.description}</p>
              <p className="muted mt-1">
                {group.members.map((m) => m.user.name.split(" ")[0]).join(", ")}
                {membership.isOrganizer && " · you organize this group"}
              </p>
              <p className="mt-2 text-sm"><Balance cents={net} /></p>
              {pending > 0 && <p className="muted">{pending} expense(s) pending approval</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
