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
import { getSupabaseClient } from "@/lib/supabaseClient";
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const getSupabaseLoadError = (error: unknown) => {
    if (!(error instanceof Error)) {
      return "Failed to load shared data from Supabase.";
    }

    if (error.message.includes("Failed to fetch")) {
      return "Unable to reach Supabase. Check your NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and network connectivity.";
    }

    if (error.message.includes("Could not find the table")) {
      return "Supabase schema is missing. Create the expected tables from supabase-schema.sql or update your Supabase project schema.";
    }

    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("permission denied") ||
      error.message.includes("JWT") ||
      error.message.includes("Forbidden")
    ) {
      return "Supabase authentication failed. Check your NEXT_PUBLIC_SUPABASE_ANON_KEY and project permissions.";
    }

    return error.message;
  };

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setLoadError(
        "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setIsLoaded(true);
      return;
    }

    async function loadDataFromSupabase() {
      try {
        const [roommatesData, expensesData] = await Promise.all([
          fetchRoommates(),
          fetchExpenses(),
        ]);
        setRoommates(roommatesData);
        setExpenses(expensesData);
      } catch (error) {
        console.error(error);
        setLoadError(getSupabaseLoadError(error));
      } finally {
        setIsLoaded(true);
      }
    }

    loadDataFromSupabase();

    const channel = supabase
      .channel("public:shared-data")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "roommates" },
        () => {
          loadDataFromSupabase();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => {
          loadDataFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- Roommate handlers ---
  const handleAddRoommate = async (name: string) => {
    setActionError(null);
    try {
      const roommate = await createRoommate(name);
      setRoommates((prev) => [...prev, roommate]);
    } catch (error) {
      console.error(error);
      setActionError(
        error instanceof Error
          ? `Unable to add roommate: ${error.message}`
          : "Unable to add roommate. Check Supabase connection and keys."
      );
    }
  };

  const handleEditRoommate = async (id: string, name: string) => {
    setActionError(null);
    const success = await updateRoommate(id, name);
    if (success) {
      setRoommates((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name } : r))
      );
      return;
    }
    setActionError("Unable to update roommate. Check your Supabase connection.");
  };

  const handleDeleteRoommate = async (id: string) => {
    setActionError(null);
    const success = await deleteRoommate(id);
    if (success) {
      setRoommates((prev) => prev.filter((r) => r.id !== id));
      setExpenses((prev) => prev.filter((e) => e.paidBy !== id));
      return;
    }
    setActionError("Unable to remove roommate. Check your Supabase connection.");
  };

  // --- Expense handlers ---
  const handleSaveExpense = async (expense: Omit<Expense, "id">, id?: string) => {
    setActionError(null);
    if (id) {
      const updated = await updateExpense(id, expense);
      if (updated) {
        setExpenses((prev) =>
          prev.map((e) => (e.id === id ? updated : e))
        );
        setEditingExpense(null);
        return;
      }
      setActionError("Unable to update expense. Check your Supabase connection and keys.");
    } else {
      const created = await createExpense(expense);
      if (created) {
        setExpenses((prev) => [created, ...prev]);
        return;
      }
      setActionError("Unable to create expense. Check your Supabase connection and keys.");
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    setActionError(null);
    const success = await deleteExpense(id);
    if (success) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      return;
    }
    setActionError("Unable to delete expense. Check your Supabase connection.");
  };

  const handleClearAll = async () => {
    setActionError(null);
    const success = await clearAllData();
    if (success) {
      setRoommates([]);
      setExpenses([]);
      return;
    }
    setActionError("Unable to clear data. Check your Supabase connection.");
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

  if (loadError) {
    const title = loadError.includes("Supabase schema")
      ? "Supabase Schema Missing"
      : loadError.includes("authentication") || loadError.includes("auth")
      ? "Supabase Authentication Failed"
      : loadError.includes("Unable to reach Supabase")
      ? "Supabase Connection Failed"
      : "Supabase Not Configured";

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900 mb-3">{title}</h1>
          <p className="text-sm text-slate-600 mb-4">{loadError}</p>
          <p className="text-sm text-slate-500">
            Add the required environment variables to <span className="font-medium">.env.local</span> or in Vercel
            and refresh the page.
          </p>
        </div>
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
        {actionError && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {actionError}
          </div>
        )}

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
