# SplitSmart — interactive prototype

A demo of the core SplitSmart journey on Next.js 15 + React 19 + Tailwind 4, with
SQLite via Prisma 6. It is a **prototype**, not the production architecture.

> **Prototype behavior, not production:** "sign-in" is a demo-user switcher (a plain
> cookie, no passwords), notifications are in-app records only (nothing is emailed
> or pushed), and recorded payments move no money. Receipts, group creation/editing,
> and named multi-level approval chains are not implemented (see approval policy below).

## Run it

```bash
cd prototype
npm install
cp .env.example .env        # DATABASE_URL="file:./dev.db" (skip if .env exists)
npm run db:setup            # prisma migrate deploy + idempotent demo seed
npm run dev                 # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run db:migrate` | Apply pending migrations (`prisma migrate deploy`; never resets data) |
| `npm run db:seed` | Idempotent demo data: only creates missing records, never deletes/overwrites |
| `npm run db:setup` | Both of the above |
| `npm run lint` / `npm run build` / `npm test` | Checks (tests cover money splitting and balances) |

After changing `prisma/schema.prisma` use `npx prisma migrate dev --name <change>`.

## Demo script

1. **Dashboard** (`/`) – group balances, pending approvals, recent activity, notifications.
   Use the **Demo user** switcher (top right). Alex and Jordan are approvers.
2. **Groups** (`/groups`, `/groups/<id>`) – members, who-owes-whom, expenses (filterable), payments.
3. **Add expense** (`/expenses/new`) – equal or percentage split with live per-person
   preview; payer may be outside the participants. New expenses are *pending*.
4. **Approvals** (`/approvals`) – approvers approve or reject (reason required to reject). Each group
   requires N distinct approvals (organizer sets it on the group page; Lisbon Trip demo needs 2). One
   rejection ends it. Only approved expenses change balances; you can’t review your own.
5. **Record payment** (`/groups/<id>/pay`) – partial or full; amounts above what is owed are rejected.
6. **Reports** (`/reports`) – expenses and payments with inclusive date range and group filter.

## Design notes

- Money is stored as **integer cents**; percentages as integer basis points. Leftover
  cents go to the largest fractional shares, ties by selection order (`src/lib/money.ts`).
- Prisma is used only in server code (`src/lib/*`, server actions, server components);
  the browser bundle never imports it.
- Balances are derived from approved expenses + payments (`src/lib/balances.ts`).
- The first migration baselines the pre-existing `EnvironmentCheck` table so the existing
  `dev.db` was migrated in place, not reset.
