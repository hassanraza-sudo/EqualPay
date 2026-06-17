"use client";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense, Roommate } from "@/types";

export type Database = {
  public: {
    Tables: {
      roommates: {
        Row: Roommate;
        Insert: { name: string };
        Update: { name?: string };
        Relationships: [];
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, "id">;
        Update: Partial<Omit<Expense, "id">>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const isPlaceholderValue = (value: string) =>
    /(your[-_ ]project|your[-_ ]anon[-_ ]key|<your[-_ ]project>|<your[-_ ]anon[-_ ]key>)/i.test(value);

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    isPlaceholderValue(supabaseUrl) ||
    isPlaceholderValue(supabaseAnonKey)
  ) {
    console.error(
      "Missing or invalid Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your real Supabase project values."
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
