"use client";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense, Roommate } from "@/types";

export type Database = {
  public: {
    roommates: {
      Row: Roommate;
      Insert: { name: string };
      Update: { name?: string };
    };
    expenses: {
      Row: Expense;
      Insert: Omit<Expense, "id">;
      Update: Partial<Omit<Expense, "id">>;
    };
  };
};

let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
    return null;
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  return supabaseClient;
}
