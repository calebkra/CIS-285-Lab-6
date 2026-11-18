import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getExpenseDetail, requiredApprovalsFor } from "@/lib/data";
import { formatCents } from "@/lib/money";
import { fmtDate, ReviewForm, ShareList, StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  if (!user) notFound();
  const detail = await getExpenseDetail(id, user.id);
  if (!detail) notFound();
  const { expense: e, canReview, alreadyApproved } = detail;
  const need = e.status === "PENDING" ? await requiredApprovalsFor(e.groupId, e.submitterId) : e.approvals.length;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href={`/groups/${e.groupId}`} className="text-sm text-indigo-700 hover:underline">← {e.group.name}</Link>
      <div className="card space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">{e.description}</h1>
            <p className="muted">{fmtDate(e.date)} · paid by {e.payer.name} · submitted by {e.submitter.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{formatCents(e.amountCents)}</p>
            <StatusBadge status={e.status} />
          </div>
        </div>
        {e.status !== "PENDING" && (
          <p className="text-sm">
            {e.status === "APPROVED" ? "Approved" : "Rejected"} by {e.decidedBy?.name ?? "—"}
            {e.decidedAt && ` on ${fmtDate(e.decidedAt)}`}.{e.decisionNote && ` Note: ${e.decisionNote}`}
          </p>
        )}
        {e.status === "PENDING" && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Awaiting approval ({e.approvals.length} of {need}) — this expense does not affect balances yet.
            {alreadyApproved && " You have already approved it."}
          </p>
        )}
        {e.approvals.length > 0 && (
          <div>
            <h2 className="h2 mb-1">Approvals</h2>
            <ul className="text-sm">
              {e.approvals.map((a) => (
                <li key={a.reviewerId}>✓ {a.reviewer.name} <span className="text-slate-500">· {fmtDate(a.createdAt)}</span></li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className="h2 mb-1">Split ({e.splitMethod === "PERCENT" ? "by percentage" : "equal"})</h2>
          <ShareList e={e} />
        </div>
        {canReview && <ReviewForm expenseId={e.id} returnTo={`/expenses/${e.id}`} />}
      </div>
    </div>
  );
}
