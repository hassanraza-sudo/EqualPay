# EqualPay — Roommate Expense Sharing App

A clean, minimal, production-ready web app for managing and splitting shared household expenses equally among roommates. No login, no backend — all data lives in your browser's localStorage.

---

## Features

- **Dashboard** — Total expenses, member count, per-person share at a glance
- **Roommates** — Add, edit, and remove roommates
- **Expenses** — Add, edit, delete expenses with title, amount, category, date, and payer
- **Equal Split** — Auto-calculates each person's balance and generates settlement suggestions
- **Expense History** — Filter by category or roommate, clear all data with confirmation
- **Pakistani Rupee (Rs.)** currency format
- **Mobile-first** responsive design
- **localStorage** persistence — data survives page refreshes

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

# 2. Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

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
