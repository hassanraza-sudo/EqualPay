import { Expense, Roommate } from "@/types";
import { getSupabaseClient } from "@/lib/supabaseClient";

function getSupabase(): any {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error(
      "Supabase client unavailable. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return supabase;
}

export async function fetchRoommates(): Promise<Roommate[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("roommates")
    .select("id,name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch roommates:", error);
    return [];
  }

  return data || [];
}

export async function fetchExpenses(): Promise<Expense[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("expenses")
    .select("id,title,amount,paidBy,participants,notes,date,category")
    .order("date", { ascending: false });

  if (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }

  return data || [];
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Math.random().toString(36).slice(2, 10)}`;
}

export async function createRoommate(name: string): Promise<Roommate | null> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn(
      "Supabase unavailable — creating roommate locally so the UI remains responsive."
    );
    return { id: generateId(), name };
  }

  const { data, error } = await supabase
    .from("roommates")
    .insert({ name })
    .select("id,name")
    .single();

  if (error) {
    console.error("Failed to create roommate:", error);
    return null;
  }

  return data;
}

export async function updateRoommate(id: string, name: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("roommates")
    .update({ name })
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

  const { error } = await supabase
    .from("roommates")
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
    console.warn(
      "Supabase unavailable — creating expense locally so the UI remains responsive."
    );
    return { id: generateId(), ...expense };
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert(expense)
    .select("id,title,amount,paidBy,participants,notes,date,category")
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
    console.warn(
      "Supabase unavailable — updating expense locally so the UI remains responsive."
    );
    return { id, ...expense };
  }

  const { data, error } = await supabase
    .from("expenses")
    .update(expense)
    .eq("id", id)
    .select("id,title,amount,paidBy,participants,notes,date,category")
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

  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete expense:", error);
    return false;
  }

  return true;
}

export async function clearAllData(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error: deleteExpensesError } = await supabase.from("expenses").delete();
  if (deleteExpensesError) {
    console.error("Failed to clear expenses:", deleteExpensesError);
    return false;
  }

  const { error: deleteRoommatesError } = await supabase.from("roommates").delete();
  if (deleteRoommatesError) {
    console.error("Failed to clear roommates:", deleteRoommatesError);
    return false;
  }

  return true;
}
