"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Receipt, Trash } from "lucide-react";
import Card from "./Card";
import EmptyState from "./EmptyState";
import CategoryBadge from "./CategoryBadge";
import ConfirmDialog from "./ConfirmDialog";
import { CATEGORIES, Category, Expense, Roommate } from "@/types";
import { formatCurrency, formatDate } from "@/utils/calculations";

interface ExpenseHistoryProps {
  expenses: Expense[];
  roommates: Roommate[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function ExpenseHistory({
  expenses,
  roommates,
  onEdit,
  onDelete,
  onClearAll,
}: ExpenseHistoryProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [roommateFilter, setRoommateFilter] = useState<string>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);

  const roommateMap = useMemo(() => {
    const map = new Map<string, string>();
    roommates.forEach((r) => map.set(r.id, r.name));
    return map;
  }, [roommates]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) =>
        categoryFilter === "All" ? true : e.category === categoryFilter
      )
      .filter((e) =>
        roommateFilter === "All" ? true : e.paidBy === roommateFilter
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, categoryFilter, roommateFilter]);

  const expenseToDelete = expenses.find((e) => e.id === deleteId);

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Receipt size={18} className="text-primary-600" />
          Expense History
        </h2>
        {expenses.length > 0 && (
          <button
            onClick={() => setShowClearAll(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash size={14} />
            Clear All Data
          </button>
        )}
      </div>

      {expenses.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-600"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={roommateFilter}
            onChange={(e) => setRoommateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-600"
          >
            <option value="All">All Roommates</option>
            {roommates.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {(categoryFilter !== "All" || roommateFilter !== "All") && (
            <button
              onClick={() => {
                setCategoryFilter("All");
                setRoommateFilter("All");
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          icon={<Receipt size={24} />}
          title="No expenses yet"
          description="Add your first expense to start tracking shared costs."
        />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState
          icon={<Receipt size={24} />}
          title="No matching expenses"
          description="Try changing or resetting the filters."
        />
      ) : (
        <ul className="space-y-2">
          {filteredExpenses.map((expense) => (
            <li
              key={expense.id}
              className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-medium text-slate-800 truncate">
                    {expense.title}
                  </span>
                  <CategoryBadge category={expense.category} />
                </div>
                <p className="text-xs text-slate-500">
                  Paid by{" "}
                  <span className="font-medium text-slate-600">
                    {roommateMap.get(expense.paidBy) || "Unknown"}
                  </span>{" "}
                  · {formatDate(expense.date)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Shared by {expense.participants?.map((id) => roommateMap.get(id) || "Unknown").join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                  {formatCurrency(expense.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    aria-label="Edit expense"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(expense.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Delete expense"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Expense"
        message={`Are you sure you want to delete "${expenseToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) onDelete(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={showClearAll}
        title="Clear All Data"
        message="This will permanently delete all roommates and expenses from this browser. This action cannot be undone."
        confirmLabel="Clear Everything"
        onConfirm={() => {
          onClearAll();
          setShowClearAll(false);
        }}
        onCancel={() => setShowClearAll(false)}
      />
    </Card>
  );
}
