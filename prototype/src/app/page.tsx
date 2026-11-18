"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatCents } from "@/lib/splitsmart";

type Member = { id: number; name: string };
type Participant = { memberId: number; shareCents: number; member: Member };
type Expense = { id: number; description: string; amountCents: number; payer: Member; participants: Participant[] };
type Group = { id: number; name: string; members: Member[]; expenses: Expense[] };

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGroups = useCallback(async (preferredId?: number) => {
    const response = await fetch("/api/groups", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load groups.");
    const data: Group[] = await response.json();
    setGroups(data);
    setSelectedId((current) => preferredId ?? (current && data.some((group) => group.id === current) ? current : data[0]?.id ?? null));
  }, []);

  useEffect(() => {
    loadGroups().catch((error) => setMessage({ text: error.message, type: "error" })).finally(() => setLoading(false));
  }, [loadGroups]);

  const selected = useMemo(() => groups.find((group) => group.id === selectedId) ?? null, [groups, selectedId]);
  const balances = useMemo(() => {
    if (!selected) return [];
    const totals = new Map(selected.members.map((member) => [member.id, 0]));
    for (const expense of selected.expenses) {
      totals.set(expense.payer.id, (totals.get(expense.payer.id) ?? 0) + expense.amountCents);
      for (const participant of expense.participants) {
        totals.set(participant.memberId, (totals.get(participant.memberId) ?? 0) - participant.shareCents);
      }
    }
    return selected.members.map((member) => ({ ...member, balanceCents: totals.get(member.id) ?? 0 }));
  }, [selected]);
  const balanceSum = balances.reduce((sum, member) => sum + member.balanceCents, 0);

  async function submitGroup(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    const response = await fetch("/api/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: groupName }) });
    const data = await response.json();
    if (!response.ok) return setMessage({ text: data.error, type: "error" });
    setGroupName("");
    await loadGroups(data.id);
    setMessage({ text: `${data.name} created.`, type: "success" });
  }

  async function submitMember(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setMessage(null);
    const response = await fetch(`/api/groups/${selected.id}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: memberName }) });
    const data = await response.json();
    if (!response.ok) return setMessage({ text: data.error, type: "error" });
    setMemberName("");
    await loadGroups(selected.id);
    setMessage({ text: `${data.name} added.`, type: "success" });
  }

  async function createExpense(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setMessage(null);
    const response = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groupId: selected.id, description, amount, payerId: Number(payerId), participantIds }) });
    const data = await response.json();
    if (!response.ok) return setMessage({ text: data.error, type: "error" });
    setDescription(""); setAmount(""); setPayerId(""); setParticipantIds([]);
    await loadGroups(selected.id);
    setMessage({ text: "Expense recorded.", type: "success" });
  }

  function toggleParticipant(id: number) {
    setParticipantIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function selectGroup(id: number) {
    setSelectedId(id); setPayerId(""); setParticipantIds([]); setMessage(null);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div><p className="eyebrow">Shared expenses</p><h1>SplitSmart</h1></div>
        <form className="group-create" onSubmit={submitGroup}><label className="sr-only" htmlFor="group-name">Group name</label><input id="group-name" value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="New group name" /><button type="submit">Create group</button></form>
      </header>
      {message && <div className={`notice ${message.type}`} role="status">{message.text}</div>}
      <div className="workspace">
        <aside className="sidebar">
          <div className="section-heading"><p>Groups</p><span>{groups.length}</span></div>
          {loading ? <p className="empty">Loading...</p> : groups.length === 0 ? <p className="empty">Create a group to begin.</p> : <div className="group-list">{groups.map((group) => <button key={group.id} type="button" className={group.id === selectedId ? "group-row active" : "group-row"} onClick={() => selectGroup(group.id)}><span>{group.name}</span><small>{group.members.length} members</small></button>)}</div>}
        </aside>
        <section className="content">
          {!selected ? <div className="start-state"><h2>Start with a group</h2><p>Create a group, then add the people who will share expenses.</p></div> : <>
            <div className="selected-title"><div><p className="eyebrow">Current group</p><h2>{selected.name}</h2></div><span>{selected.expenses.length} expense{selected.expenses.length === 1 ? "" : "s"}</span></div>
            <div className="member-panel"><div className="section-heading"><p>Members</p><span>{selected.members.length}</span></div><form className="inline-form" onSubmit={submitMember}><label className="sr-only" htmlFor="member-name">Member name</label><input id="member-name" value={memberName} onChange={(event) => setMemberName(event.target.value)} placeholder="Member name" /><button type="submit">Add</button></form><div className="members">{selected.members.map((member) => <span key={member.id}>{member.name}</span>)}{selected.members.length === 0 && <p className="empty">No members yet.</p>}</div></div>
            <div className="main-grid">
              <section className="panel expense-form-panel"><div className="section-heading"><p>Record expense</p></div><form className="expense-form" onSubmit={createExpense}><label>Description<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Dinner, supplies, rent..." /></label><label>Amount (USD)<input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="60.00" /></label><label>Payer<select value={payerId} onChange={(event) => setPayerId(event.target.value)} disabled={selected.members.length === 0}><option value="">Select payer</option>{selected.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><fieldset><legend>Participants</legend><div className="participant-grid">{selected.members.map((member) => <label key={member.id} className="check"><input type="checkbox" checked={participantIds.includes(member.id)} onChange={() => toggleParticipant(member.id)} /><span>{member.name}</span></label>)}</div>{selected.members.length === 0 && <p className="empty">Add members before recording an expense.</p>}</fieldset><button className="primary" type="submit" disabled={selected.members.length === 0}>Record expense</button></form></section>
              <section className="panel balances-panel"><div className="section-heading"><p>Balances</p><span className={balanceSum === 0 ? "balanced" : ""}>{balanceSum === 0 ? "Balanced" : "Check"}</span></div><div className="balance-list">{balances.map((member) => <div className="balance-row" key={member.id}><span>{member.name}</span><strong className={member.balanceCents > 0 ? "positive" : member.balanceCents < 0 ? "negative" : ""}>{member.balanceCents > 0 ? "+" : ""}{formatCents(member.balanceCents)}</strong></div>)}{balances.length === 0 && <p className="empty">Balances appear after members and expenses are added.</p>}</div></section>
            </div>
            <section className="panel history-panel"><div className="section-heading"><p>Expense history</p><span>{selected.expenses.length}</span></div>{selected.expenses.length === 0 ? <p className="empty">No expenses recorded.</p> : <div className="history-list">{selected.expenses.map((expense) => <article key={expense.id}><div><h3>{expense.description}</h3><p>Paid by <strong>{expense.payer.name}</strong></p></div><div className="history-shares">{expense.participants.map((participant) => <span key={participant.memberId}>{participant.member.name} {formatCents(participant.shareCents)}</span>)}</div><strong className="amount">{formatCents(expense.amountCents)}</strong></article>)}</div>}</section>
          </>}
        </section>
      </div>
    </main>
  );
}
