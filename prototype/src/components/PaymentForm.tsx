"use client";

import { useActionState, useState } from "react";
import { recordPayment, type FormState } from "@/app/actions";
import { formatCents } from "@/lib/money";
import { SubmitButton } from "./SubmitButton";

type Debt = { fromId: string; toId: string; cents: number };

export function PaymentForm({
  groupId,
  members,
  debts,
  currentUserId,
  today,
}: {
  groupId: string;
  members: { id: string; name: string }[];
  debts: Debt[];
  currentUserId: string;
  today: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(recordPayment, {});
  const firstDebt = debts.find((d) => d.fromId === currentUserId) ?? debts[0];
  const [fromId, setFromId] = useState(firstDebt?.fromId ?? currentUserId);
  const [toId, setToId] = useState(firstDebt?.toId ?? members.find((m) => m.id !== currentUserId)?.id ?? "");
  const [amount, setAmount] = useState("");
  const due = debts.find((d) => d.fromId === fromId && d.toId === toId)?.cents ?? 0;
  const e = state.errors ?? {};

  return (
    <form action={action} className="card space-y-4" noValidate>
      <input type="hidden" name="groupId" value={groupId} />
      {state.message && (
        <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {state.message}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fromId">From (payer)</label>
          <select id="fromId" name="fromId" className="field" value={fromId} onChange={(ev) => setFromId(ev.target.value)}>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {e.fromId && <p className="err">{e.fromId}</p>}
        </div>
        <div>
          <label className="label" htmlFor="toId">To (recipient)</label>
          <select id="toId" name="toId" className="field" value={toId} onChange={(ev) => setToId(ev.target.value)}>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {e.toId && <p className="err">{e.toId}</p>}
        </div>
      </div>

      <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm" aria-live="polite">
        {fromId === toId
          ? "Choose two different people."
          : due > 0
            ? <>Currently owed: <strong>{formatCents(due)}</strong>{" "}
                <button type="button" className="font-medium text-indigo-700 hover:underline"
                  onClick={() => setAmount((due / 100).toFixed(2))}>Pay full amount</button></>
            : "No balance is currently owed in this direction."}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="amount">Amount (USD)</label>
          <input id="amount" name="amount" inputMode="decimal" className="field" value={amount}
            onChange={(ev) => setAmount(ev.target.value)} placeholder="0.00" aria-invalid={!!e.amount} />
          {e.amount && <p className="err">{e.amount}</p>}
        </div>
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input id="date" name="date" type="date" className="field" defaultValue={today} aria-invalid={!!e.date} />
          {e.date && <p className="err">{e.date}</p>}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="note">Note (optional)</label>
        <input id="note" name="note" maxLength={200} className="field" placeholder="e.g. Venmo transfer" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton className="btn-success" pendingText="Recording…">Record payment</SubmitButton>
        <span className="muted">Prototype: this only records a payment; no money moves.</span>
      </div>
    </form>
  );
}
