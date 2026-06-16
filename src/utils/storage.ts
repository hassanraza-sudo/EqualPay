import { AppData } from "@/types";

const STORAGE_KEY = "equalpay_data_v1";

export const defaultData: AppData = {
  roommates: [],
  expenses: [],
};

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.roommates) parsed.roommates = [];
    if (!parsed.expenses) parsed.expenses = [];
    return parsed;
  } catch (e) {
    console.error("Failed to load EqualPay data:", e);
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save EqualPay data:", e);
  }
}

export function clearData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
