import { Expense, Roommate } from "@/types";
import type { Database } from "@/lib/supabaseClient";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { SupabaseClient } from "@supabase/supabase-js";

function getSupabase(): SupabaseClient<Database> | null {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error(
      "Supabase client unavailable. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return supabase;
}

function normalizeExpenseRow(row: any): Expense {
  return {
    id: row.id,
    title: row.title,
    amount: typeof row.amount === "string" ? Number(row.amount) : row.amount,
    paidBy: row.paidBy ?? row.paidby ?? row.paid_by ?? "",
    participants: row.participants ?? [],
    notes: row.notes ?? undefined,
    date: row.date,
    category: row.category,
  };
}

function mapExpenseToDb(expense: Omit<Expense, "id">) {
  const { paidBy, ...rest } = expense;
  return {
    ...rest,
    paidby: paidBy,
  };
}

export async function fetchRoommates(): Promise<Roommate[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase client unavailable.");
  }

  const { data, error } = await supabase
    .from("roommates")
    .select("id,name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message || "Failed to fetch roommates.");
  }

  return data || [];
}

export async function fetchExpenses(): Promise<Expense[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase client unavailable.");
  }

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to fetch expenses.");
  }

  return (data || []).map(normalizeExpenseRow);
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Math.random().toString(36).slice(2, 10)}`;
}

export async function createRoommate(name: string): Promise<Roommate> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase client unavailable.");
  }

  const { data, error } = await (supabase.from("roommates") as any)
    .insert({ name } as any)
    .select("id,name")
    .single();

  if (error) {
    console.error("Failed to create roommate:", error);
    throw new Error(error.message || "Failed to create roommate.");
  }

  return data;
}

export async function updateRoommate(id: string, name: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await (supabase.from("roommates") as any)
    .update({ name } as any)
    .eq("id", id);

  if (error) {
    console.error("Failed to update roommate:", error);
    return false;
  }

  return true;
}

export async function deleteRoommate(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await (supabase.from("roommates") as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete roommate:", error);
    return false;
  }

  return true;
}

export async function createExpense(
  expense: Omit<Expense, "id">
): Promise<Expense | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  const dbExpense = mapExpenseToDb(expense);
  const { data, error } = await (supabase.from("expenses") as any)
    .insert(dbExpense as any)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create expense:", error);
    return null;
  }

  return data;
}

export async function updateExpense(
  id: string,
  expense: Omit<Expense, "id">
): Promise<Expense | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  const dbExpense = mapExpenseToDb(expense);
  const { data, error } = await (supabase.from("expenses") as any)
    .update(dbExpense as any)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update expense:", error);
    return null;
  }

  return data;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await (supabase.from("expenses") as any).delete().eq("id", id);

  if (error) {
    console.error("Failed to delete expense:", error);
    return false;
  }

  return true;
}

export async function clearAllData(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error: deleteExpensesError } = await (supabase.from("expenses") as any).delete();
  if (deleteExpensesError) {
    console.error("Failed to clear expenses:", deleteExpensesError);
    return false;
  }

  const { error: deleteRoommatesError } = await (supabase.from("roommates") as any).delete();
  if (deleteRoommatesError) {
    console.error("Failed to clear roommates:", deleteRoommatesError);
    return false;
  }

  return true;
}
