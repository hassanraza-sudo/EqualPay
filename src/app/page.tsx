"use client";

import { useEffect, useState } from "react";
import { Plus, Wallet, Users, Receipt, PiggyBank } from "lucide-react";
import StatCard from "@/components/StatCard";
import RoommatesSection from "@/components/RoommatesSection";
import ExpenseFormModal from "@/components/ExpenseFormModal";
import ExpenseHistory from "@/components/ExpenseHistory";
import BalancesSection from "@/components/BalancesSection";
import { Expense, Roommate } from "@/types";
import {
  fetchRoommates,
  fetchExpenses,
  createRoommate,
  updateRoommate,
  deleteRoommate,
  createExpense,
  updateExpense,
  deleteExpense,
  clearAllData,
} from "@/utils/storage";
import {
  calculateBalances,
  calculateSettlements,
  formatCurrency,
  getTotalExpenses,
} from "@/utils/calculations";

export default function Home() {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    async function loadDataFromSupabase() {
      const [roommatesData, expensesData] = await Promise.all([
        fetchRoommates(),
        fetchExpenses(),
      ]);
      setRoommates(roommatesData);
      setExpenses(expensesData);
      setIsLoaded(true);
    }

    loadDataFromSupabase();
  }, []);

  // --- Roommate handlers ---
  const handleAddRoommate = async (name: string) => {
    const roommate = await createRoommate(name);
    if (roommate) {
      setRoommates((prev) => [...prev, roommate]);
    }
  };

  const handleEditRoommate = async (id: string, name: string) => {
    const success = await updateRoommate(id, name);
    if (success) {
      setRoommates((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name } : r))
      );
    }
  };

  const handleDeleteRoommate = async (id: string) => {
    const success = await deleteRoommate(id);
    if (success) {
      setRoommates((prev) => prev.filter((r) => r.id !== id));
      setExpenses((prev) => prev.filter((e) => e.paidBy !== id));
    }
  };

  // --- Expense handlers ---
  const handleSaveExpense = async (expense: Omit<Expense, "id">, id?: string) => {
    if (id) {
      const updated = await updateExpense(id, expense);
      if (updated) {
        setExpenses((prev) =>
          prev.map((e) => (e.id === id ? updated : e))
        );
        setEditingExpense(null);
      }
    } else {
      const created = await createExpense(expense);
      if (created) {
        setExpenses((prev) => [created, ...prev]);
      }
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    const success = await deleteExpense(id);
    if (success) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleClearAll = async () => {
    const success = await clearAllData();
    if (success) {
      setRoommates([]);
      setExpenses([]);
    }
  };

  const openAddExpenseModal = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  // --- Calculations ---
  const totalExpenses = getTotalExpenses(expenses);
  const balances = calculateBalances(roommates, expenses);
  const settlements = calculateSettlements(balances);
  const perPersonShare = roommates.length > 0 ? totalExpenses / roommates.length : 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading EqualPay...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 text-white">
              <Wallet size={18} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                EqualPay
              </h1>
              <p className="text-xs text-slate-400 leading-tight hidden sm:block">
                Split shared expenses with ease
              </p>
            </div>
          </div>
              <button
            onClick={openAddExpenseModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
        {/* Stats Overview */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Total Expenses"
              value={formatCurrency(totalExpenses)}
              icon={<Wallet size={20} />}
              iconBg="bg-primary-50"
              iconColor="text-primary-600"
            />
            <StatCard
              label="Total Members"
              value={String(roommates.length)}
              icon={<Users size={20} />}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
            />
            <StatCard
              label="Total Records"
              value={String(expenses.length)}
              icon={<Receipt size={20} />}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />
            <StatCard
              label="Share Per Person"
              value={formatCurrency(perPersonShare)}
              icon={<PiggyBank size={20} />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
          </div>
        </section>

        {/* Roommates & Balances */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <RoommatesSection
            roommates={roommates}
            onAdd={handleAddRoommate}
            onEdit={handleEditRoommate}
            onDelete={handleDeleteRoommate}
          />
          <BalancesSection
            balances={balances}
            settlements={settlements}
            hasRoommates={roommates.length > 0}
          />
        </section>

        {/* Expense History */}
        <section>
          <ExpenseHistory
            expenses={expenses}
            roommates={roommates}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            onClearAll={handleClearAll}
          />
        </section>
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        EqualPay · Data is now stored in Supabase and shared across users
      </footer>

      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        roommates={roommates}
        editingExpense={editingExpense}
      />
    </div>
  );
}
