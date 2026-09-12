import { CATEGORY_LABEL, progressOf, quietStatus, type Work } from "@/lib/atelier";
import { cn, touchLabel } from "@/lib/utils";
import { ProgressRing } from "./progress-ring";
import { Badge } from "./ui/badge";

export function WorkCard({
  work,
  onOpen,
  compact = false,
}: {
  work: Work;
  onOpen: () => void;
  compact?: boolean;
}) {
  const progress = progressOf(work);
  const quiet = quietStatus(work);
  const done = work.milestones.filter((m) => m.done).length;
  const total = work.milestones.length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex w-full flex-col rounded-lg bg-surface p-4 text-left shadow-[var(--shadow-border)]",
        "transition-[box-shadow,scale,background-color] duration-150 ease-out",
        "hover:shadow-[var(--shadow-lift)] active:scale-[0.99]",
        compact ? "gap-2" : "gap-3",
      )}
    >
      <div className="flex items-start gap-3">
        {work.lane === "active" && total > 0 ? (
          <div className="relative mt-0.5">
            <ProgressRing value={progress} size={40} />
            <span className="absolute inset-0 grid place-items-center text-xs tabular-nums text-muted">
              {done}
            </span>
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-fg">{work.title}</p>
            {quiet === "stalled" && work.lane === "active" ? (
              <Badge tone="danger">停滯</Badge>
            ) : quiet === "quiet" && work.lane === "active" ? (
              <Badge tone="warn">安靜</Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {CATEGORY_LABEL[work.category]}
            <span className="mx-1.5 text-subtle">·</span>
            {touchLabel(work.lastTouchAt)}
          </p>
        </div>
      </div>

      {!compact && work.nextAction ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">
          <span className="text-subtle">下一步 </span>
          {work.nextAction}
        </p>
      ) : null}

      {!compact && !work.nextAction && work.intent ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{work.intent}</p>
      ) : null}
    </button>
  );
}
