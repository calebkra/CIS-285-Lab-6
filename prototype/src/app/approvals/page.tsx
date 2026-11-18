import { getCurrentUser } from "@/lib/session";
import { getPendingApprovals } from "@/lib/data";
import { Empty, ExpenseSummary, ReviewForm, ShareList } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const user = await getCurrentUser();
  const items = user ? await getPendingApprovals(user.id) : [];
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="muted">Pending expenses you can review. An expense is applied to balances once it has enough approvals (set per group); one rejection ends it.</p>
      </div>
      {items.length === 0 ? (
        <Empty title="Nothing to review">
          You’re all caught up. Switch demo user (top right) to see another approver’s queue.
        </Empty>
      ) : (
        <div className="space-y-4">
          {items.map((e) => (
            <article key={e.id} className="card">
              <ExpenseSummary e={e} showGroup />
              <p className="muted mt-1">Submitted by {e.submitter.name}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium text-indigo-700">Show split ({e.splitMethod === "PERCENT" ? "percentage" : "equal"})</summary>
                <div className="mt-2"><ShareList e={e} /></div>
              </details>
              <ReviewForm expenseId={e.id} returnTo="/approvals" />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
