# EqualPay — Roommate Expense Sharing App

A clean, minimal, production-ready web app for managing and splitting shared household expenses equally among roommates. No login required for now — the app uses Supabase to store and share roommate and expense data across users and devices.

---

## Features

- **Dashboard** — Total expenses, member count, per-person share at a glance
- **Roommates** — Add, edit, and remove roommates
- **Expenses** — Add, edit, delete expenses with title, amount, category, date, and payer
- **Equal Split** — Auto-calculates each person's balance and generates settlement suggestions
- **Expense History** — Filter by category or roommate, clear all data with confirmation
- **Pakistani Rupee (Rs.)** currency format
- **Mobile-first** responsive design
- **Supabase persistence** — data is stored in a shared database and visible to everyone opening the same app URL

---

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) icons

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install
```

Create a `.env.local` file at the project root using `.env.local.example` as a template.

```bash
cp .env.local.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project.

> After changing `.env.local`, restart your dev server: `npm run dev`.

```bash
npm run dev
```

If the app still shows an error, make sure the Supabase tables are created in your project using `supabase-schema.sql`.

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Vercel Deployment

Add the following environment variables to your Vercel project dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

This ensures data persists after deployment and is shared across all users of the same link.

---

## Supabase Backend

The app uses two Supabase tables:

- `roommates` — stores roommate names
- `expenses` — stores expense title, amount, paidBy, participants, notes, date, and category

Use the schema file in `supabase-schema.sql` to create these tables and the required anon-key policies in your Supabase project.

If you already created the tables and are still blocked, re-run `supabase-schema.sql` in the SQL editor to add the missing row-level security policies.

## Project Structure

```
equalpay/
├── src/
│   ├── app/
│   │   ├── globals.css        # Global styles + Tailwind directives
│   │   ├── layout.tsx         # Root HTML layout + metadata
│   │   └── page.tsx           # Main dashboard page (all state lives here)
│   ├── components/
│   │   ├── BalancesSection.tsx    # Per-person balances + settlement suggestions
│   │   ├── Card.tsx               # Reusable card wrapper
│   │   ├── CategoryBadge.tsx      # Coloured category pill
│   │   ├── ConfirmDialog.tsx      # Generic confirmation modal
│   │   ├── EmptyState.tsx         # Empty state placeholder
│   │   ├── ExpenseFormModal.tsx   # Add/edit expense modal form
│   │   ├── ExpenseHistory.tsx     # Filterable expense list
│   │   ├── Modal.tsx              # Base modal component
│   │   ├── RoommatesSection.tsx   # Add/edit/delete roommates
│   │   └── StatCard.tsx           # Dashboard stat card
│   ├── types/
│   │   └── index.ts           # Shared TypeScript types
│   └── utils/
│       ├── calculations.ts    # Balance & settlement logic + formatters
│       └── storage.ts         # localStorage read/write helpers
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## How Splitting Works

1. Total of all expenses is summed.
2. Divided equally by number of roommates → **equal share per person**.
3. Each person's **net balance** = Amount they paid − their share.
   - Positive → they are owed money (paid more than their share)
   - Negative → they owe money (paid less than their share)
4. Settlement suggestions use a greedy algorithm to minimise the number of transactions.

---

## License

MIT — free to use and modify.
