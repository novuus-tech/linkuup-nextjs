"use client";

import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  color?: "indigo" | "emerald" | "amber" | "red";
  delay?: number;
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    icon: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-100 dark:border-indigo-500/20",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-500/20",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-500/10",
    icon: "text-red-600 dark:text-red-400",
    border: "border-red-100 dark:border-red-500/20",
  },
};

export default function StatCard({
  icon,
  label,
  value,
  color = "indigo",
  delay = 0,
}: StatCardProps) {
  const c = colorMap[color];
  const staggerClass = delay > 0 ? `stagger-${delay}` : "";

  return (
    <div
      className={`animate-slide-up ${staggerClass} flex items-center gap-4 rounded-2xl border bg-card p-5 ${c.border} transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
        <span className={c.icon}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted truncate">{label}</p>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      </div>
    </div>
  );
}
