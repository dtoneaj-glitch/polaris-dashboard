import { Check, CircleDashed } from "lucide-react";
import {
  CATEGORY_LABEL,
  ENERGY_LABEL,
  MAX_ACTIVE,
  progressOf,
  quietStatus,
  type Work,
} from "@/lib/atelier";
import { dateHeadline, touchLabel, weekdayLong } from "@/lib/utils";
import { ActivityWeek } from "./activity-week";
import { ProgressRing } from "./progress-ring";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { WorkCard } from "./work-card";

export function Overview({
  works,
  focusWork,
  onOpen,
  onCompleteFocus,
  onChangeFocus,
  onSeeActive,
  onSeePool,
  onPickFocus,
}: {
  works: Work[];
  focusWork: Work | null;
  onOpen: (id: string) => void;
  onCompleteFocus: () => void;
  onChangeFocus: () => void;
  onSeeActive: () => void;
  onSeePool: () => void;
  onPickFocus: (id: string) => void;
}) {
  const active = works.filter((w) => w.lane === "active");
  const pool = works.filter((w) => w.lane === "pool");
  const parked = works.filter((w) => w.lane === "parked");
  const quiet = active.filter((w) => quietStatus(w) !== "alive");
  const weekTouches = active.filter((w) => quietStatus(w) === "alive").length;

  return (
    <div className="space-y-8">
      <header className="rise-in">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          {weekdayLong()}
        </p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight text-fg sm:text-5xl">
          {dateHeadline()}
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          進度不是感覺，是最後一次動手的日期。進行中最多 {MAX_ACTIVE}{" "}
          件；其餘先養在靈感池。
        </p>
      </header>

      <section className="rise-in rise-in-1 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-medium tracking-tight">今日焦點</h2>
          {focusWork ? <Badge tone="paper">一件就好</Badge> : null}
        </div>
        {focusWork ? (
          <div className="space-y-4">
            <button type="button" onClick={() => onOpen(focusWork.id)} className="block w-full text-left">
              <p className="text-xs text-muted">{CATEGORY_LABEL[focusWork.category]}</p>
              <p className="mt-1 font-display text-2xl font-medium tracking-tight">{focusWork.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {focusWork.nextAction || "還沒寫下一步。點進去補一句。"}
              </p>
            </button>
            <div className="flex flex-wrap gap-2">
              <Button onClick={onCompleteFocus}>
                <Check className="size-4" />
                今天這件做了
              </Button>
              <Button variant="ghost" onClick={onChangeFocus}>
                換一件
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted">
              還沒選。從進行中挑一件，當今天唯一要推進的事。
            </p>
            {active.length === 0 ? (
              <Button variant="secondary" onClick={onSeeActive}>
                去開第一件
              </Button>
            ) : (
              <ul className="space-y-2">
                {active.map((w) => (
                  <li key={w.id}>
                    <button
                      type="button"
                      onClick={() => onPickFocus(w.id)}
                      className="flex w-full items-center justify-between rounded-md bg-raised px-3 py-3 text-left hover:bg-raised/70"
                    >
                      <span className="font-medium">{w.title}</span>
                      <span className="text-xs text-muted">{w.nextAction || "補下一步"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="rise-in rise-in-2 space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-medium tracking-tight">
            進行中
            <span className="ml-2 font-sans text-sm tabular-nums text-muted">
              {active.length}/{MAX_ACTIVE}
            </span>
          </h2>
          <button type="button" onClick={onSeeActive} className="text-xs text-muted hover:text-fg">
            全部
          </button>
        </div>
        {active.length === 0 ? (
          <EmptyLine text="目前沒有進行中的事。從靈感池提一件上來，或新開一件。" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {active.map((w) => (
              <ActiveMini key={w.id} work={w} onOpen={() => onOpen(w.id)} />
            ))}
          </div>
        )}
        <p className="text-xs text-subtle">
          本週有動手的進行中項目{" "}
          <span className="tabular-nums text-muted">{weekTouches}</span>
          {quiet.length > 0 ? ` · ${quiet.length} 件開始安靜` : ""}
        </p>
      </section>

      <div className="rise-in rise-in-3 grid gap-3 lg:grid-cols-2">
        <ActivityWeek works={works} />
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-medium tracking-tight">安靜雷達</h2>
            <span className="text-xs text-muted">超過一週沒碰</span>
          </div>
          {quiet.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted">
              進行中的項目這週都有動過。保持這樣就好。
            </p>
          ) : (
            <ul className="space-y-2">
              {quiet.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(w.id)}
                    className="flex w-full items-center justify-between rounded-md bg-raised px-3 py-3 text-left hover:bg-raised/70"
                  >
                    <span className="font-medium">{w.title}</span>
                    <span className="text-xs text-muted">{touchLabel(w.lastTouchAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rise-in rise-in-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-medium tracking-tight">
            靈感池
            <span className="ml-2 font-sans text-sm tabular-nums text-muted">{pool.length}</span>
          </h2>
          <button type="button" onClick={onSeePool} className="text-xs text-muted hover:text-fg">
            打開筆記本
          </button>
        </div>
        {pool.length === 0 ? (
          <EmptyLine text="池子是空的。想到什麼先丟進來，不要立刻變成進行中。" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pool.slice(0, 4).map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => onOpen(w.id)}
                className="rounded-lg bg-surface p-4 text-left shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-lift)]"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone="mute">{CATEGORY_LABEL[w.category]}</Badge>
                  <span className="text-xs text-subtle">{ENERGY_LABEL[w.energy]}</span>
                </div>
                <p className="font-display text-xl font-medium tracking-tight">{w.title}</p>
                {w.intent ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{w.intent}</p>
                ) : null}
              </button>
            ))}
          </div>
        )}
        {parked.length > 0 ? (
          <p className="text-xs text-subtle">另有 {parked.length} 件停放中，之後隨時可以撿回來。</p>
        ) : null}
      </section>
    </div>
  );
}

function ActiveMini({ work, onOpen }: { work: Work; onOpen: () => void }) {
  const progress = progressOf(work);
  const quiet = quietStatus(work);
  const done = work.milestones.filter((m) => m.done).length;
  const total = work.milestones.length;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-3 rounded-lg bg-surface p-4 text-left shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{work.title}</p>
            {quiet !== "alive" ? (
              <Badge tone={quiet === "stalled" ? "danger" : "warn"}>
                {quiet === "stalled" ? "停滯" : "安靜"}
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted">{touchLabel(work.lastTouchAt)}</p>
        </div>
        {total > 0 ? (
          <div className="relative">
            <ProgressRing value={progress} size={36} />
            <span className="absolute inset-0 grid place-items-center text-xs tabular-nums text-muted">
              {done}
            </span>
          </div>
        ) : (
          <CircleDashed className="size-5 text-subtle" />
        )}
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-muted">
        {work.nextAction || work.intent || "還沒有下一步"}
      </p>
    </button>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-surface px-4 py-6 text-sm leading-relaxed text-muted shadow-[var(--shadow-border)]">
      {text}
    </div>
  );
}

export function WorkList({
  title,
  hint,
  works,
  empty,
  onOpen,
  onAdd,
  addLabel,
}: {
  title: string;
  hint: string;
  works: Work[];
  empty: string;
  onOpen: (id: string) => void;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">{title}</h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">{hint}</p>
        </div>
        {onAdd && addLabel ? (
          <Button variant="secondary" size="sm" onClick={onAdd}>
            {addLabel}
          </Button>
        ) : null}
      </header>
      {works.length === 0 ? (
        <EmptyLine text={empty} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {works.map((w) => (
            <WorkCard key={w.id} work={w} onOpen={() => onOpen(w.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
