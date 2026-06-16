"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { CATEGORIES, Category, Expense, Roommate } from "@/types";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, "id">, id?: string) => void;
  roommates: Roommate[];
  editingExpense: Expense | null;
}

const todayISO = () => new Date().toISOString().split("T")[0];

export default function ExpenseFormModal({
  isOpen,
  onClose,
  onSave,
  roommates,
  editingExpense,
}: ExpenseFormModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState<Category>("Food");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const defaultParticipants = roommates.map((r) => r.id);

      if (editingExpense) {
        setTitle(editingExpense.title);
        setAmount(String(editingExpense.amount));
        setPaidBy(editingExpense.paidBy);
        setParticipants(editingExpense.participants ?? defaultParticipants);
        setDate(editingExpense.date);
        setCategory(editingExpense.category);
      } else {
        setTitle("");
        setAmount("");
        setPaidBy(roommates[0]?.id || "");
        setParticipants(defaultParticipants);
        setDate(todayISO());
        setCategory("Food");
      }
      setError("");
    }
  }, [isOpen, editingExpense, roommates]);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const numAmount = parseFloat(amount);

    if (!trimmedTitle) {
      setError("Please enter an expense title");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    if (!paidBy) {
      setError("Please select who paid");
      return;
    }
    if (participants.length === 0) {
      setError("Please select at least one participant");
      return;
    }
    if (!date) {
      setError("Please select a date");
      return;
    }

    onSave(
      {
        title: trimmedTitle,
        amount: numAmount,
        paidBy,
        participants,
        date,
        category,
      },
      editingExpense?.id
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? "Edit Expense" : "Add Expense"}
    >
      {roommates.length === 0 ? (
        <div className="text-sm text-slate-500 py-4 text-center">
          Please add at least one roommate before adding an expense.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Expense Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Electricity bill"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Amount (Rs.)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {roommates.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Participants
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roommates.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={participants.includes(r.id)}
                      onChange={() => {
                        setParticipants((prev) =>
                          prev.includes(r.id)
                            ? prev.filter((id) => id !== r.id)
                            : [...prev, r.id]
                        );
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{r.name}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Only selected roommates will share this expense.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors text-sm"
            >
              {editingExpense ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
