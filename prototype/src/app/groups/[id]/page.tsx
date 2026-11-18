import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getGroupDetail } from "@/lib/data";
import { netFor } from "@/lib/balances";
import { formatCents } from "@/lib/money";
import { Balance, Empty, ExpenseSummary, fmtDate } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { updateApprovalPolicy } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ id }, { status }, user] = await Promise.all([params, searchParams, getCurrentUser()]);
  if (!user) notFound();
  const detail = await getGroupDetail(id, user.id);
  if (!detail) notFound();
  const { group, expenses, payments, debts } = detail;

  const filter = ["PENDING", "APPROVED", "REJECTED"].includes(status ?? "") ? status! : "ALL";
  const shown = filter === "ALL" ? expenses : expenses.filter((e) => e.status === filter);
  const name = (uid: string) => group.members.find((m) => m.userId === uid)?.user.name ?? "Unknown";
  const me = group.members.find((m) => m.userId === user.id);
  const approverCount = group.members.filter((m) => m.canApprove).length;
  const myDebts = debts.filter((d) => d.fromId === user.id || d.toId === user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/groups" className="text-sm text-indigo-700 hover:underline">← Groups</Link>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="muted">{group.description}</p>
          <p className="mt-1 text-sm"><Balance cents={netFor(user.id, debts)} /></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/expenses/new?group=${group.id}`} className="btn-primary">+ Add expense</Link>
          <Link href={`/groups/${group.id}/pay`} className="btn-secondary">Record payment</Link>
          <Link href={`/reports?group=${group.id}`} className="btn-secondary">Report</Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="mem-h" className="space-y-3">
          <h2 id="mem-h" className="h2">Members</h2>
          <ul className="card divide-y divide-slate-100 p-0!">
            {group.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="font-medium">{m.user.name}{m.userId === user.id && " (you)"}</p>
                  <p className="muted">{m.isOrganizer ? "Organizer" : "Member"}{m.canApprove ? " · Approver" : ""}</p>
                </div>
                <span className="text-sm">
                  {(() => {
                    const n = netFor(m.userId, debts);
                    return n === 0 ? <span className="text-slate-500">Settled</span> : (
                      <span className={n > 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                        {n > 0 ? "+" : "−"}{formatCents(Math.abs(n))}
                      </span>
                    );
                  })()}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="bal-h" className="space-y-3">
          <h2 id="bal-h" className="h2">Who owes whom</h2>
          <p className="muted">Based on approved expenses and recorded payments only.</p>
          {debts.length === 0 ? (
            <Empty title="Everyone is settled up" />
          ) : (
            <ul className="card divide-y divide-slate-100 p-0!">
              {debts.map((d) => (
                <li key={d.fromId + d.toId} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span className={d.fromId === user.id || d.toId === user.id ? "font-medium" : ""}>
                    {name(d.fromId)} owes {name(d.toId)}
                  </span>
                  <span className="font-semibold">{formatCents(d.cents)}</span>
                </li>
              ))}
            </ul>
          )}
          {myDebts.some((d) => d.fromId === user.id) && (
            <Link href={`/groups/${group.id}/pay`} className="btn-success">Settle up</Link>
          )}
        </section>
      </div>

      <section aria-labelledby="pol-h" className="card space-y-2">
        <h2 id="pol-h" className="h2">Approval policy</h2>
        <p className="muted">
          Each expense needs <strong>{group.requiredApprovals}</strong> approval{group.requiredApprovals === 1 ? "" : "s"} from
          different approvers ({approverCount} in this group) before it changes balances. Any single rejection (with a reason) ends it.
          The submitter can’t approve their own expense.
        </p>
        {me?.isOrganizer ? (
          <form action={updateApprovalPolicy} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="groupId" value={group.id} />
            <div>
              <label className="label" htmlFor="requiredApprovals">Approvals required</label>
              <select id="requiredApprovals" name="requiredApprovals" defaultValue={group.requiredApprovals} className="field w-auto!">
                {Array.from({ length: approverCount }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <SubmitButton className="btn-secondary" pendingText="Saving…">Save</SubmitButton>
          </form>
        ) : (
          <p className="muted">Only the organizer can change this.</p>
        )}
      </section>

      <section aria-labelledby="exp-h" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="exp-h" className="h2">Expenses</h2>
          <nav aria-label="Filter expenses" className="flex gap-1 text-sm">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
              <Link
                key={s}
                href={s === "ALL" ? `/groups/${group.id}` : `/groups/${group.id}?status=${s}`}
                aria-current={filter === s ? "true" : undefined}
                className={`rounded-full px-3 py-1 ${filter === s ? "bg-indigo-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"}`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </Link>
            ))}
          </nav>
        </div>
        {shown.length === 0 ? (
          <Empty title="No expenses here">
            {filter === "ALL" ? "Add the first expense for this group." : "Try a different filter."}
          </Empty>
        ) : (
          <ul className="card divide-y divide-slate-100 p-0!">
            {shown.map((e) => (
              <li key={e.id} className="px-4 py-3"><ExpenseSummary e={e} /></li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pay-h" className="space-y-3">
        <h2 id="pay-h" className="h2">Payments</h2>
        {payments.length === 0 ? (
          <Empty title="No payments recorded yet" />
        ) : (
          <ul className="card divide-y divide-slate-100 p-0!">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between gap-2 px-4 py-3">
                <div>
                  <p className="font-medium">{p.from.name} paid {p.to.name}</p>
                  <p className="muted">{fmtDate(p.date)}{p.note && ` · ${p.note}`}</p>
                </div>
                <span className="font-semibold text-emerald-700">{formatCents(p.amountCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
