export type Category =
  | "Food"
  | "Rent"
  | "Bills"
  | "Grocery"
  | "Transport"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Rent",
  "Bills",
  "Grocery",
  "Transport",
  "Other",
];

export interface Roommate {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // roommate id
  participants: string[]; // roommate ids who shared this expense
  notes?: string;
  date: string; // ISO date string (yyyy-mm-dd)
  category: Category;
}

export interface AppData {
  roommates: Roommate[];
  expenses: Expense[];
}

export interface Balance {
  id: string;
  name: string;
  paid: number;
  share: number;
  net: number; // paid - share. positive => should receive, negative => owes
}

export interface Settlement {
  from: string; // name of person who owes
  to: string; // name of person who receives
  amount: number;
}
