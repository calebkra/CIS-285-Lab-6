import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getGroupDetail } from "@/lib/data";
import { PaymentForm } from "@/components/PaymentForm";

export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  if (!user) notFound();
  const detail = await getGroupDetail(id, user.id);
  if (!detail) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href={`/groups/${id}`} className="text-sm text-indigo-700 hover:underline">← {detail.group.name}</Link>
      <h1 className="text-2xl font-bold">Record a payment</h1>
      <PaymentForm
        groupId={id}
        members={detail.group.members.map((m) => ({ id: m.userId, name: m.user.name }))}
        debts={detail.debts}
        currentUserId={user.id}
        today={new Date().toISOString().slice(0, 10)}
      />
    </div>
  );
}
