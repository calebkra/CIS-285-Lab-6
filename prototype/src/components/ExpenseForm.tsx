"use client";

import { useActionState, useMemo, useState } from "react";
import { createExpense, type FormState } from "@/app/actions";
import { formatCents, parseAmountToCents, parsePercentToBp, splitByBasisPoints, splitEqual } from "@/lib/money";
import { SubmitButton } from "./SubmitButton";

type GroupOpt = { id: string; name: string; members: { id: string; name: string }[] };

export function ExpenseForm({
  groups,
  defaultGroupId,
  currentUserId,
  today,
}: {
  groups: GroupOpt[];
  defaultGroupId: string;
  currentUserId: string;
  today: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(createExpense, {});
  const [groupId, setGroupId] = useState(defaultGroupId);
  const group = groups.find((g) => g.id === groupId) ?? groups[0];
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [payerId, setPayerId] = useState(currentUserId);
  const [method, setMethod] = useState<"EQUAL" | "PERCENT">("EQUAL");
  const [selected, setSelected] = useState<string[]>(group.members.map((m) => m.id));
  const [pct, setPct] = useState<Record<string, string>>({});

  const members = group.members;
  const participants = members.filter((m) => selected.includes(m.id));
  const cents = parseAmountToCents(amount);

  const preview = useMemo(() => {
    if (!cents || cents <= 0 || participants.length === 0) return null;
    if (method === "EQUAL") return splitEqual(cents, participants.length);
    const bps = participants.map((p) => parsePercentToBp(pct[p.id] ?? ""));
    if (bps.some((b) => b === null) || bps.reduce<number>((a, b) => a + (b ?? 0), 0) !== 10000) return null;
    return splitByBasisPoints(cents, bps as number[]);
  }, [cents, participants, method, pct]);

  const pctTotal = participants.reduce((s, p) => s + (parsePercentToBp(pct[p.id] ?? "") ?? 0), 0);

  function changeGroup(id: string) {
    const g = groups.find((x) => x.id === id)!;
    setGroupId(id);
    setSelected(g.members.map((m) => m.id));
    setPayerId(g.members.some((m) => m.id === currentUserId) ? currentUserId : g.members[0].id);
    setPct({});
  }

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function evenPercents() {
    const n = participants.length;
    if (!n) return;
    const base = Math.floor(10000 / n);
    const next: Record<string, string> = {};
    participants.forEach((p, i) => {
      const bp = base + (i === 0 ? 10000 - base * n : 0);
      next[p.id] = (bp / 100).toFixed(2);
    });
    setPct(next);
  }

  const e = state.errors ?? {};

  return (
    <form action={action} className="card space-y-5" noValidate>
      {state.message && (
        <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {state.message}
        </div>
      )}
      <input type="hidden" name="groupId" value={groupId} />

      <div>
        <label className="label" htmlFor="group">Group</label>
        <select id="group" className="field" value={groupId} onChange={(ev) => changeGroup(ev.target.value)}>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <input id="description" name="description" className="field" value={description} maxLength={120}
          onChange={(ev) => setDescription(ev.target.value)} aria-invalid={!!e.description} placeholder="e.g. Groceries" />
        {e.description && <p className="err">{e.description}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="amount">Amount (USD)</label>
          <input id="amount" name="amount" inputMode="decimal" className="field" value={amount}
            onChange={(ev) => setAmount(ev.target.value)} aria-invalid={!!e.amount} placeholder="0.00" />
          {e.amount && <p className="err">{e.amount}</p>}
        </div>
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input id="date" name="date" type="date" className="field" value={date}
            onChange={(ev) => setDate(ev.target.value)} aria-invalid={!!e.date} />
          {e.date && <p className="err">{e.date}</p>}
        </div>
        <div>
          <label className="label" htmlFor="payerId">Paid by</label>
          <select id="payerId" name="payerId" className="field" value={payerId} onChange={(ev) => setPayerId(ev.target.value)}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {e.payerId && <p className="err">{e.payerId}</p>}
        </div>
      </div>

      <fieldset>
        <legend className="label">Split method</legend>
        <div className="flex gap-4 text-sm">
          {(["EQUAL", "PERCENT"] as const).map((m) => (
            <label key={m} className="flex items-center gap-2">
              <input type="radio" name="splitMethod" value={m} checked={method === m} onChange={() => setMethod(m)} />
              {m === "EQUAL" ? "Equal" : "By percentage"}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Participants</legend>
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {members.map((m, i) => {
            const on = selected.includes(m.id);
            const idx = participants.findIndex((p) => p.id === m.id);
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                <label className="flex min-w-40 flex-1 items-center gap-2 text-sm">
                  <input type="checkbox" name="participants" value={m.id} checked={on} onChange={() => toggle(m.id)} />
                  {m.name}
                </label>
                {on && method === "PERCENT" && (
                  <span className="flex items-center gap-1">
                    <label className="sr-only" htmlFor={`pct-${i}`}>Percent for {m.name}</label>
                    <input id={`pct-${i}`} name={`pct_${m.id}`} inputMode="decimal" className="field w-24!"
                      placeholder="0" value={pct[m.id] ?? ""} onChange={(ev) => setPct({ ...pct, [m.id]: ev.target.value })} />
                    <span className="text-sm text-slate-500">%</span>
                  </span>
                )}
                {on && preview && (
                  <span className="w-20 text-right text-sm font-medium">{formatCents(preview[idx])}</span>
                )}
              </li>
            );
          })}
        </ul>
        {e.participants && <p className="err">{e.participants}</p>}
        {method === "PERCENT" && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className={pctTotal === 10000 ? "text-emerald-700" : "text-slate-600"}>
              Total: {(pctTotal / 100).toFixed(2)}% {pctTotal === 10000 ? "✓" : "(must be 100%)"}
            </span>
            <button type="button" className="font-medium text-indigo-700 hover:underline" onClick={evenPercents}>
              Distribute evenly
            </button>
          </div>
        )}
        {e.split && <p className="err">{e.split}</p>}
        <p className="muted mt-2">
          The payer may be left out of the participants. Leftover cents go to the largest fractional shares.
        </p>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingText="Submitting…">Submit for approval</SubmitButton>
        <span className="muted">Expenses stay pending and don’t change balances until approved.</span>
      </div>
    </form>
  );
}
