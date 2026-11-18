import { getCurrentUser } from "@/lib/session";
import { getReport, getUserGroups, parseDateInput } from "@/lib/data";
import { formatCents } from "@/lib/money";
import { Empty, fmtDate, StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; from?: string; to?: string }>;
}) {
  const [sp, user] = await Promise.all([searchParams, getCurrentUser()]);
  if (!user) return <Empty title="No demo data yet">Run <code>npm run db:setup</code>.</Empty>;

  const groups = await getUserGroups(user.id);
  const from = parseDateInput(sp.from);
  const to = parseDateInput(sp.to);
  // inclusive end date: include the whole last day
  const toEnd = to ? new Date(to.getTime() + 86_400_000 - 1) : null;
  const rangeError =
    (sp.from && !from) || (sp.to && !to)
      ? "Enter valid dates."
      : from && to && from > to
        ? "The start date must be on or before the end date."
        : null;
  const groupId = groups.some((g) => g.group.id === sp.group) ? sp.group : undefined;

  const report = rangeError ? null : await getReport(user.id, { groupId, from, to: toEnd });
  const empty = report && report.expenses.length === 0 && report.payments.length === 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="muted">Expenses and payments for your groups. Dates are inclusive.</p>
      </div>

      <form method="get" className="card grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="group">Group</label>
          <select id="group" name="group" className="field" defaultValue={groupId ?? ""}>
            <option value="">All my groups</option>
            {groups.map(({ group }) => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="from">From</label>
          <input id="from" name="from" type="date" className="field" defaultValue={sp.from ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="to">To</label>
          <input id="to" name="to" type="date" className="field" defaultValue={sp.to ?? ""} />
        </div>
        <div className="flex gap-2">
          <button className="btn-primary">Apply</button>
          <a href="/reports" className="btn-secondary">Reset</a>
        </div>
      </form>

      {rangeError && <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900">{rangeError}</div>}

      {report && (
        <>
          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Approved expenses", formatCents(report.totals.approvedCents), `${report.totals.approvedCount} items`],
              ["Your share (approved)", formatCents(report.totals.yourShareCents), "your portion"],
              ["Payments", formatCents(report.totals.paymentsCents), `${report.payments.length} recorded`],
              ["Pending / rejected", `${report.totals.pendingCount} / ${report.totals.rejectedCount}`, "not in balances"],
            ].map(([k, v, sub]) => (
              <div key={k} className="card p-3!">
                <dt className="muted">{k}</dt>
                <dd className="text-xl font-bold">{v}</dd>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
            ))}
          </dl>

          {empty ? (
            <Empty title="No activity in this period">Try widening the date range or choosing a different group.</Empty>
          ) : (
            <>
              <section className="space-y-2">
                <h2 className="h2">Expenses</h2>
                {report.expenses.length === 0 ? <Empty title="No expenses in range" /> : (
                  <div className="card overflow-x-auto p-0!">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Description</th><th className="px-4 py-2">Group</th><th className="px-4 py-2">Payer</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 text-right">Amount</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.expenses.map((e) => (
                          <tr key={e.id}>
                            <td className="px-4 py-2 whitespace-nowrap">{fmtDate(e.date)}</td>
                            <td className="px-4 py-2">{e.description}</td>
                            <td className="px-4 py-2">{e.group.name}</td>
                            <td className="px-4 py-2">{e.payer.name}</td>
                            <td className="px-4 py-2"><StatusBadge status={e.status} /></td>
                            <td className="px-4 py-2 text-right font-medium">{formatCents(e.amountCents)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              <section className="space-y-2">
                <h2 className="h2">Payments</h2>
                {report.payments.length === 0 ? <Empty title="No payments in range" /> : (
                  <div className="card overflow-x-auto p-0!">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">From</th><th className="px-4 py-2">To</th><th className="px-4 py-2">Group</th><th className="px-4 py-2 text-right">Amount</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.payments.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-2 whitespace-nowrap">{fmtDate(p.date)}</td>
                            <td className="px-4 py-2">{p.from.name}</td>
                            <td className="px-4 py-2">{p.to.name}</td>
                            <td className="px-4 py-2">{p.group.name}</td>
                            <td className="px-4 py-2 text-right font-medium">{formatCents(p.amountCents)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
