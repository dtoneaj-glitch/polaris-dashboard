import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Plus, Trash2, X } from "lucide-react";
import {
  ENERGY_LABEL,
  LANE_LABEL,
  progressOf,
  quietStatus,
  type Energy,
  type Lane,
  type NoteKind,
  type Work,
} from "@/lib/atelier";
import { useAtelier } from "@/lib/store";
import { cn, touchLabel } from "@/lib/utils";
import { CategorySelect } from "./category-select";
import { ProgressRing } from "./progress-ring";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

const LANES: Lane[] = ["active", "pool", "parked", "done"];
const ENERGIES: Energy[] = ["spark", "warm", "hot"];
const NOTE_KINDS: { id: NoteKind; label: string }[] = [
  { id: "win", label: "進展" },
  { id: "log", label: "紀錄" },
  { id: "idea", label: "發想" },
];

export function WorkSheet({
  work,
  onClose,
  onNeedPark,
}: {
  work: Work | null;
  onClose: () => void;
  onNeedPark: (id: string) => void;
}) {
  if (!work) return null;
  return <OpenWorkSheet key={work.id} work={work} onClose={onClose} onNeedPark={onNeedPark} />;
}

function OpenWorkSheet({
  work,
  onClose,
  onNeedPark,
}: {
  work: Work;
  onClose: () => void;
  onNeedPark: (id: string) => void;
}) {
  const updateWork = useAtelier((s) => s.updateWork);
  const setLane = useAtelier((s) => s.setLane);
  const addMilestone = useAtelier((s) => s.addMilestone);
  const toggleMilestone = useAtelier((s) => s.toggleMilestone);
  const removeMilestone = useAtelier((s) => s.removeMilestone);
  const addNote = useAtelier((s) => s.addNote);
  const removeNote = useAtelier((s) => s.removeNote);
  const setFocus = useAtelier((s) => s.setFocus);
  const removeWork = useAtelier((s) => s.removeWork);
  const focus = useAtelier((s) => s.focus);

  const [title, setTitle] = useState(work.title);
  const [intent, setIntent] = useState(work.intent);
  const [nextAction, setNextAction] = useState(work.nextAction);
  const [msDraft, setMsDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [noteKind, setNoteKind] = useState<NoteKind>("win");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setTitle(work.title);
    setIntent(work.intent);
    setNextAction(work.nextAction);
    setMsDraft("");
    setNoteDraft("");
    setConfirmDelete(false);
  }, [work.id]);

  const progress = progressOf(work);
  const quiet = quietStatus(work);
  const isFocus = focus.workId === work.id;
  const done = work.milestones.filter((m) => m.done).length;

  function commitMeta() {
    updateWork(work.id, { title, intent, nextAction });
  }

  function handleLane(lane: Lane) {
    const result = setLane(work.id, lane);
    if (!result.ok) onNeedPark(work.id);
  }

  return (
    <Dialog.Root open={!!work} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/70" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-lg flex-col bg-surface shadow-[var(--shadow-lift)] outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative">
                <ProgressRing value={progress} size={36} />
                <span className="absolute inset-0 grid place-items-center text-xs tabular-nums text-muted">
                  {done}
                </span>
              </div>
              <div className="min-w-0">
                <Dialog.Title className="truncate font-display text-lg font-medium tracking-tight">
                  {work.title}
                </Dialog.Title>
                <p className="text-xs text-muted">
                  {touchLabel(work.lastTouchAt)}
                  {quiet === "stalled" ? " · 已超過兩週沒動" : quiet === "quiet" ? " · 這週很安靜" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-11 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-fg"
              aria-label="關閉"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
            <section className="space-y-3">
              <Label htmlFor="work-title">名稱</Label>
              <Input
                id="work-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitMeta}
              />
              <Label htmlFor="work-intent">為什麼做</Label>
              <Textarea
                id="work-intent"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                onBlur={commitMeta}
                rows={3}
                placeholder="一句話就夠。用來提醒自己不是在收集專案。"
              />
            </section>

            <section className="space-y-2">
              <Label>位置</Label>
              <div className="flex flex-wrap gap-1.5">
                {LANES.map((lane) => (
                  <button
                    key={lane}
                    type="button"
                    onClick={() => handleLane(lane)}
                    className={cn(
                      "h-9 rounded-full px-3 text-xs font-medium transition-[background-color,color] duration-150",
                      work.lane === lane ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg",
                    )}
                  >
                    {LANE_LABEL[lane]}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <Label>類型</Label>
              <CategorySelect
                value={work.category}
                onChange={(category) => updateWork(work.id, { category })}
              />
            </section>

            {work.lane === "pool" ? (
              <section className="space-y-2">
                <Label>火候</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ENERGIES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => updateWork(work.id, { energy: e })}
                      className={cn(
                        "h-9 rounded-full px-3 text-xs font-medium transition-[background-color,color] duration-150",
                        work.energy === e ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg",
                      )}
                    >
                      {ENERGY_LABEL[e]}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-2">
              <Label htmlFor="next-action">下一步（只寫一件）</Label>
              <Input
                id="next-action"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                onBlur={commitMeta}
                placeholder="小到今天做得出來"
              />
              {work.lane === "active" ? (
                <Button
                  type="button"
                  variant={isFocus ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setFocus(isFocus ? null : work.id)}
                >
                  {isFocus ? "已是今日焦點" : "設為今日焦點"}
                </Button>
              ) : null}
            </section>

            <section className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Label>里程碑</Label>
                <span className="text-xs tabular-nums text-subtle">
                  {done}/{work.milestones.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {work.milestones.map((m) => (
                  <li key={m.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleMilestone(work.id, m.id)}
                      className={cn(
                        "flex min-h-11 flex-1 items-center gap-3 rounded-md px-2 text-left text-sm",
                        "hover:bg-raised",
                        m.done ? "text-muted line-through" : "text-fg",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-xs border",
                          m.done ? "border-alive bg-alive text-bg" : "border-border-strong",
                        )}
                      >
                        {m.done ? <Check className="size-3" strokeWidth={3} /> : null}
                      </span>
                      {m.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMilestone(work.id, m.id)}
                      className="flex size-11 items-center justify-center text-subtle hover:text-danger"
                      aria-label="刪除里程碑"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addMilestone(work.id, msDraft);
                  setMsDraft("");
                }}
              >
                <Input
                  value={msDraft}
                  onChange={(e) => setMsDraft(e.target.value)}
                  placeholder="加一個看得見的終點"
                />
                <Button type="submit" variant="secondary" size="icon" aria-label="新增里程碑">
                  <Plus />
                </Button>
              </form>
            </section>

            <section className="space-y-3">
              <Label>動手紀錄</Label>
              <div className="flex gap-1.5">
                {NOTE_KINDS.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setNoteKind(k.id)}
                    className={cn(
                      "h-9 rounded-full px-3 text-xs font-medium",
                      noteKind === k.id ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg",
                    )}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addNote(work.id, noteDraft, noteKind);
                  setNoteDraft("");
                }}
              >
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="今天做了什麼、卡在哪、或剛想到的一句"
                  rows={3}
                />
                <Button type="submit" variant="primary" size="sm">
                  記下
                </Button>
              </form>
              <ul className="space-y-3">
                {work.notes.length === 0 ? (
                  <li className="text-sm text-subtle">還沒有紀錄。寫一句就算進度。</li>
                ) : (
                  work.notes.map((n) => (
                    <li key={n.id} className="rounded-md bg-raised px-3 py-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-xs text-subtle">
                          {n.kind === "win" ? "進展" : n.kind === "idea" ? "發想" : "紀錄"}
                          <span className="mx-1.5">·</span>
                          {touchLabel(n.createdAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNote(work.id, n.id)}
                          className="text-subtle hover:text-danger"
                          aria-label="刪除紀錄"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed text-fg">{n.body}</p>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="border-t border-border pt-4">
              {confirmDelete ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted">確定刪除？無法復原。</p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      removeWork(work.id);
                      onClose();
                    }}
                  >
                    刪除
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                    取消
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="size-3.5" />
                  刪除此項
                </Button>
              )}
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function QuietBadge({ work }: { work: Work }) {
  const q = quietStatus(work);
  if (q === "stalled") return <Badge tone="danger">停滯</Badge>;
  if (q === "quiet") return <Badge tone="warn">安靜</Badge>;
  return <Badge tone="alive">有在動</Badge>;
}
