import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "not_started":
      return "Not Started";
    case "in_progress":
      return "In Progress";
    case "done":
      return "Done";
    default:
      return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "not_started":
      return "bg-muted text-muted-foreground";
    case "in_progress":
      return "bg-primary/10 text-primary";
    case "done":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function getPlanLabel(plan: string): string {
  switch (plan) {
    case "this_week":
      return "This Week";
    case "this_month":
      return "This Month";
    default:
      return "";
  }
}

export function calculateProgress(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}
