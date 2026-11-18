import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getNotifications, getPendingApprovals, getRecentActivity, getUserGroups } from "@/lib/data";
import { formatCents } from "@/lib/money";
import { Balance, Empty, ExpenseSummary, fmtDate, ReviewForm } from "@/components/ui";
import { markNotificationsRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Empty title="No demo data yet">
        Run <code>npm run db:setup</code> in <code>prototype/</code> to apply migrations and seed demo users, then reload.
      </Empty>
    );
  }
  const [groups, approvals, activity, notes] = await Promise.all([
    getUserGroups(user.id),
    getPendingApprovals(user.id),
    getRecentActivity(user.id),
    getNotifications(user.id),
  ]);
  const totalNet = groups.reduce((s, g) => s + g.net, 0);
  const unread = notes.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hi, {user.name.split(" ")[0]}</h1>
        <p className="muted">
          Across all groups: <Balance cents={totalNet} />
        </p>
      </div>

      <section aria-labelledby="groups-h" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="groups-h" className="h2">Your groups</h2>
          <Link href="/groups" className="text-sm font-medium text-indigo-700 hover:underline">View all</Link>
        </div>
        {groups.length === 0 ? (
          <Empty title="You are not in any groups yet">Ask an organizer to add you, or run the seed script.</Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map(({ group, net, pending }) => (
              <Link key={group.id} href={`/groups/${group.id}`} className="card block hover:border-indigo-300">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{group.name}</h3>
                  {pending > 0 && <span className="badge bg-amber-100 text-amber-900">{pending} pending</span>}
                </div>
                <p className="muted">{group.members.length} members</p>
                <p className="mt-2 text-sm"><Balance cents={net} /></p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="appr-h" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="appr-h" className="h2">Pending approvals {approvals.length > 0 && `(${approvals.length})`}</h2>
          <Link href="/approvals" className="text-sm font-medium text-indigo-700 hover:underline">Open queue</Link>
        </div>
        {approvals.length === 0 ? (
          <Empty title="Nothing waiting for your review">
            Only group approvers see expenses here, and never their own submissions.
          </Empty>
        ) : (
          <div className="space-y-3">
            {approvals.slice(0, 3).map((e) => (
              <div key={e.id} className="card">
                <ExpenseSummary e={e} showGroup />
                <p className="muted mt-1">Submitted by {e.submitter.name}</p>
                <ReviewForm expenseId={e.id} returnTo="/" />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="act-h" className="space-y-3">
          <h2 id="act-h" className="h2">Recent activity</h2>
          {activity.length === 0 ? (
            <Empty title="No activity yet">Add an expense to get started.</Empty>
          ) : (
            <ul className="card divide-y divide-slate-100 p-0!">
              {activity.map((a) => (
                <li key={a.kind + (a.kind === "expense" ? a.expense.id : a.payment.id)} className="px-4 py-3">
                  {a.kind === "expense" ? (
                    <ExpenseSummary e={a.expense} showGroup />
                  ) : (
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {a.payment.from.name} paid {a.payment.to.name}
                        </p>
                        <p className="muted">{fmtDate(a.payment.date)} · {a.payment.group.name}</p>
                      </div>
                      <span className="font-semibold text-emerald-700">{formatCents(a.payment.amountCents)}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="note-h" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="note-h" className="h2">Notifications {unread > 0 && `(${unread} new)`}</h2>
            {unread > 0 && (
              <form action={markNotificationsRead}>
                <button className="text-sm font-medium text-indigo-700 hover:underline">Mark all read</button>
              </form>
            )}
          </div>
          <p className="muted">Prototype: in-app only. No email or push is sent.</p>
          {notes.length === 0 ? (
            <Empty title="No notifications" />
          ) : (
            <ul className="card divide-y divide-slate-100 p-0!">
              {notes.map((n) => (
                <li key={n.id} className={`px-4 py-3 text-sm ${n.readAt ? "text-slate-600" : "font-medium"}`}>
                  {n.message}
                  <span className="muted block">{n.group.name} · {fmtDate(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
