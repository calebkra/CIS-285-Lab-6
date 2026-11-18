import { getCurrentUser } from "@/lib/session";
import { getUserGroups } from "@/lib/data";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NewExpense({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const [{ group }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const groups = user ? await getUserGroups(user.id) : [];
  if (!user || groups.length === 0) {
    return <Empty title="Join a group first">You need to belong to a group to add an expense.</Empty>;
  }
  const options = groups.map(({ group: g }) => ({
    id: g.id,
    name: g.name,
    members: g.members.map((m) => ({ id: m.userId, name: m.user.name })),
  }));
  const defaultGroupId = options.some((o) => o.id === group) ? group! : options[0].id;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Add an expense</h1>
      <ExpenseForm
        key={defaultGroupId}
        groups={options}
        defaultGroupId={defaultGroupId}
        currentUserId={user.id}
        today={new Date().toISOString().slice(0, 10)}
      />
    </div>
  );
}
