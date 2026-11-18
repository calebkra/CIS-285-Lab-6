import Link from "next/link";
import { reviewExpense } from "@/app/actions";
import { formatBp, formatCents } from "@/lib/money";
import { SubmitButton } from "./SubmitButton";

export function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-900",
    APPROVED: "bg-emerald-100 text-emerald-900",
    REJECTED: "bg-rose-100 text-rose-900",
  };
  return <span className={`badge ${styles[status] ?? "bg-slate-100"}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}

/** Signed balance: green when owed to you, red when you owe. */
export function Balance({ cents }: { cents: number }) {
  if (cents === 0) return <span className="font-semibold text-slate-600">Settled up</span>;
  return (
    <span className={`font-semibold ${cents > 0 ? "text-emerald-700" : "text-rose-700"}`}>
      {cents > 0 ? `You are owed ${formatCents(cents)}` : `You owe ${formatCents(-cents)}`}
    </span>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <p className="font-medium text-slate-800">{title}</p>
      {children && <div className="muted mt-1">{children}</div>}
    </div>
  );
}

type ExpenseLike = {
  id: string;
  description: string;
  amountCents: number;
  date: Date;
  status: string;
  splitMethod: string;
  payer: { name: string };
  submitter: { name: string };
  group?: { name: string; requiredApprovals: number };
  approvals: { reviewerId: string; reviewer: { name: string } }[];
  shares: { userId: string; shareCents: number; percentBp: number | null; user: { name: string } }[];
};

export function ExpenseSummary({ e, showGroup }: { e: ExpenseLike; showGroup?: boolean }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <Link href={`/expenses/${e.id}`} className="font-medium text-indigo-700 hover:underline">
          {e.description}
        </Link>
        <p className="muted">
          {fmtDate(e.date)} · paid by {e.payer.name}
          {showGroup && e.group ? ` · ${e.group.name}` : ""}
        </p>
      </div>
      <div className="text-right">
        <div className="font-semibold">{formatCents(e.amountCents)}</div>
        <StatusBadge status={e.status} />
        {e.status === "PENDING" && e.group && (
          <p className="text-xs text-slate-500">
            {e.approvals.length} of {e.group.requiredApprovals} approval{e.group.requiredApprovals === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </div>
  );
}

export function ShareList({ e }: { e: ExpenseLike }) {
  return (
    <ul className="divide-y divide-slate-100 text-sm">
      {e.shares.map((s) => (
        <li key={s.userId} className="flex justify-between py-1.5">
          <span>
            {s.user.name}
            {s.percentBp != null && <span className="text-slate-500"> ({formatBp(s.percentBp)})</span>}
          </span>
          <span className="font-medium">{formatCents(s.shareCents)}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReviewForm({ expenseId, returnTo }: { expenseId: string; returnTo: string }) {
  return (
    <form action={reviewExpense} className="mt-3 space-y-2">
      <input type="hidden" name="expenseId" value={expenseId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="label" htmlFor={`note-${expenseId}`}>
        Note <span className="font-normal text-slate-500">(required to reject)</span>
      </label>
      <input id={`note-${expenseId}`} name="note" maxLength={300} className="field" placeholder="Optional comment for the submitter" />
      <div className="flex flex-wrap gap-2">
        <SubmitButton className="btn-success" name="decision" value="approve" pendingText="Working…">
          Approve
        </SubmitButton>
        <SubmitButton className="btn-danger" name="decision" value="reject" pendingText="Working…">
          Reject
        </SubmitButton>
      </div>
    </form>
  );
}
