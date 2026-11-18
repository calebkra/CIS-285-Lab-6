"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCents } from "@/lib/money";

type Group = { id: number; name: string };
type Member = { id: number; name: string };
type Expense = {
  id: number;
  description: string;
  amountCents: number;
  payer: string;
  participants: { memberId: number; name: string; shareCents: number }[];
};
type Balance = { memberId: number; name: string; balanceCents: number };

async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, body === undefined ? undefined : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed.");
  return data as T;
}

const input = "border rounded px-2 py-1 w-full bg-transparent border-gray-400";
const btn = "bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 disabled:opacity-50";
const card = "border border-gray-300 rounded-lg p-4 mb-4";

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [error, setError] = useState("");

  const [groupName, setGroupName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const run = async (fn: () => Promise<void>) => {
    setError("");
    try { await fn(); } catch (e) { setError((e as Error).message); }
  };

  const loadGroup = useCallback(async (id: number) => {
    const [m, e, b] = await Promise.all([
      api<Member[]>(`/api/groups/${id}/members`),
      api<Expense[]>(`/api/groups/${id}/expenses`),
      api<Balance[]>(`/api/groups/${id}/balances`),
    ]);
    setMembers(m); setExpenses(e); setBalances(b);
  }, []);

  useEffect(() => {
    run(async () => {
      const gs = await api<Group[]>("/api/groups");
      setGroups(gs);
      const saved = Number(localStorage.getItem("splitsmart.group"));
      const pick = gs.find((g) => g.id === saved) ?? gs[0];
      if (pick) setGroupId(pick.id);
    });
  }, []);

  useEffect(() => {
    setPayerId(""); setSelected([]);
    if (groupId === null) { setMembers([]); setExpenses([]); setBalances([]); return; }
    localStorage.setItem("splitsmart.group", String(groupId));
    run(() => loadGroup(groupId));
  }, [groupId, loadGroup]);

  const createGroup = (ev: React.FormEvent) => {
    ev.preventDefault();
    run(async () => {
      const g = await api<Group>("/api/groups", { name: groupName });
      setGroups((gs) => [...gs, g]); setGroupId(g.id); setGroupName("");
    });
  };

  const addMember = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (groupId === null) return;
    run(async () => {
      await api(`/api/groups/${groupId}/members`, { name: memberName });
      setMemberName(""); await loadGroup(groupId);
    });
  };

  const addExpense = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (groupId === null) return;
    run(async () => {
      await api(`/api/groups/${groupId}/expenses`, {
        description: desc, amount, payerId: payerId ? Number(payerId) : null, participantIds: selected,
      });
      setDesc(""); setAmount(""); await loadGroup(groupId);
    });
  };

  const toggle = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">SplitSmart</h1>
      {error && (
        <div role="alert" className="mb-4 rounded border border-red-500 bg-red-100 text-red-800 p-3">{error}</div>
      )}

      <section className={card}>
        <h2 className="font-semibold text-lg mb-2">Groups</h2>
        <form onSubmit={createGroup} className="flex gap-2 mb-3">
          <input aria-label="New group name" className={input} placeholder="New group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          <button className={btn}>Create</button>
        </form>
        {groups.length === 0 ? <p className="text-gray-500">No groups yet.</p> : (
          <select aria-label="Select group" className={input} value={groupId ?? ""} onChange={(e) => setGroupId(Number(e.target.value))}>
            {groups.map((g) => <option key={g.id} value={g.id} className="text-black">{g.name}</option>)}
          </select>
        )}
      </section>

      {groupId !== null && (<>
        <section className={card}>
          <h2 className="font-semibold text-lg mb-2">Members</h2>
          <form onSubmit={addMember} className="flex gap-2 mb-3">
            <input aria-label="New member name" className={input} placeholder="Member name" value={memberName} onChange={(e) => setMemberName(e.target.value)} />
            <button className={btn}>Add</button>
          </form>
          {members.length === 0 ? <p className="text-gray-500">No members yet.</p> : (
            <ul className="list-disc ml-5">{members.map((m) => <li key={m.id}>{m.name}</li>)}</ul>
          )}
        </section>

        <section className={card}>
          <h2 className="font-semibold text-lg mb-2">Record expense</h2>
          <form onSubmit={addExpense} className="grid gap-2">
            <input aria-label="Description" className={input} placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <input aria-label="Amount" className={input} placeholder="Amount (e.g. 60.00)" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <select aria-label="Payer" className={input} value={payerId} onChange={(e) => setPayerId(e.target.value)}>
              <option value="" className="text-black">Who paid?</option>
              {members.map((m) => <option key={m.id} value={m.id} className="text-black">{m.name}</option>)}
            </select>
            <fieldset>
              <legend className="text-sm mb-1">Split between:</legend>
              <div className="flex flex-wrap gap-3">
                {members.map((m) => (
                  <label key={m.id} className="flex items-center gap-1">
                    <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggle(m.id)} /> {m.name}
                  </label>
                ))}
              </div>
              {members.length > 0 && (
                <button type="button" className="text-sm underline mt-1" onClick={() => setSelected(members.map((m) => m.id))}>Select all</button>
              )}
            </fieldset>
            <div><button className={btn}>Add expense</button></div>
          </form>
        </section>

        <section className={card}>
          <h2 className="font-semibold text-lg mb-2">Balances</h2>
          {balances.length === 0 ? <p className="text-gray-500">No members yet.</p> : (
            <ul>
              {balances.map((b) => (
                <li key={b.memberId} className="flex justify-between border-b border-gray-200 py-1">
                  <span>{b.name}</span>
                  <span className={b.balanceCents > 0 ? "text-green-600 font-mono" : b.balanceCents < 0 ? "text-red-600 font-mono" : "font-mono"}>
                    {b.balanceCents > 0 ? "+" : ""}{formatCents(b.balanceCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card}>
          <h2 className="font-semibold text-lg mb-2">Expense history</h2>
          {expenses.length === 0 ? <p className="text-gray-500">No expenses yet.</p> : (
            <ul className="grid gap-2">
              {expenses.map((e) => (
                <li key={e.id} className="border-b border-gray-200 pb-2">
                  <div className="flex justify-between"><strong>{e.description}</strong><span className="font-mono">{formatCents(e.amountCents)}</span></div>
                  <div className="text-sm text-gray-500">
                    Paid by {e.payer} · Split: {e.participants.map((p) => `${p.name} ${formatCents(p.shareCents)}`).join(", ")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </>)}
    </main>
  );
}
