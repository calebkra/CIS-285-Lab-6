# SplitSmart Prototype

A local Next.js prototype for creating groups, adding members, recording shared expenses, viewing expense history, and calculating balances. Monetary values are stored and calculated in integer cents with deterministic remainder distribution.

## Run locally

```bash
cd /workspaces/CIS-285-Lab-6/prototype
npm run dev
```

Open the URL printed by Next.js (the development server uses port 3000 when available).

The existing SQLite database is configured through `DATABASE_URL` in `.env`. If the schema has not been applied yet:

```bash
npx prisma db push
npx prisma generate
```

## Verification

```bash
npx vitest run
npm run lint
npm run build
```
