import { activityByDay, type Work } from "@/lib/atelier";
import { cn } from "@/lib/utils";

export function ActivityWeek({ works }: { works: Work[] }) {
  const days = activityByDay(works, 14);
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((n, d) => n + d.count, 0);
  const week = days.slice(-7).reduce((n, d) => n + d.count, 0);

  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-medium tracking-tight">動手的日子</h2>
        <p className="text-xs text-muted">
          本週 <span className="tabular-nums text-fg">{week}</span> 則
          <span className="mx-1.5 text-subtle">·</span>
          十四天 <span className="tabular-nums text-fg">{total}</span>
        </p>
      </div>
      <div className="flex h-20 items-end gap-1">
        {days.map((d, i) => {
          const h = d.count === 0 ? 6 : Math.max(10, Math.round((d.count / max) * 80));
          const isToday = i === days.length - 1;
          return (
            <div key={d.day} className="flex flex-1 flex-col items-center justify-end gap-1">
              <div
                className={cn(
                  "w-full rounded-xs",
                  d.count === 0 ? "bg-raised" : isToday ? "bg-accent" : "bg-accent/55",
                )}
                style={{ height: h }}
                title={`${new Date(d.day).getMonth() + 1}/${new Date(d.day).getDate()} · ${d.count}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-subtle">
        <span>兩週前</span>
        <span>今天</span>
      </div>
    </section>
  );
}
