import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDays(days: number): string {
  if (days === 1) return "1 день";
  if (days < 5) return `${days} дні`;
  return `${days} днів`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
