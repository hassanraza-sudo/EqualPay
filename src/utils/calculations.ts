import { Balance, Expense, Roommate, Settlement } from "@/types";

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return `Rs. ${rounded.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

/**
 * Calculate per-person balances based on equal split.
 */
export function calculateBalances(
  roommates: Roommate[],
  expenses: Expense[]
): Balance[] {
  return roommates.map((r) => {
    const paid = expenses
      .filter((e) => e.paidBy === r.id)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const share = expenses.reduce((sum, e) => {
      const participants =
        e.participants && e.participants.length > 0
          ? e.participants
          : roommates.map((roommate) => roommate.id);

      if (!participants.includes(r.id)) return sum;
      return sum + Number(e.amount) / participants.length;
    }, 0);

    const net = paid - share;
    return {
      id: r.id,
      name: r.name,
      paid,
      share,
      net,
    };
  });
}

/**
 * Generate simple settlement suggestions: people who owe (negative net)
 * pay people who are owed (positive net), greedily matching largest amounts.
 */
export function calculateSettlements(balances: Balance[]): Settlement[] {
  const EPSILON = 0.01;

  const debtors = balances
    .filter((b) => b.net < -EPSILON)
    .map((b) => ({ id: b.id, name: b.name, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter((b) => b.net > EPSILON)
    .map((b) => ({ id: b.id, name: b.name, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > EPSILON) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= EPSILON) i++;
    if (creditor.amount <= EPSILON) j++;
  }

  return settlements;
}
