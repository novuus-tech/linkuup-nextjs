"use client";

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="h-4 w-20" />
      <SkeletonBlock className="h-4 w-16 ml-auto" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-fade-in divide-y divide-card-border">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-fade-in rounded-2xl border border-card-border bg-card p-5">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-12 w-12 rounded-xl" />
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-6 w-14" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
