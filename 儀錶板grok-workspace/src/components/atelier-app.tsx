import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Layers, MoreHorizontal, PenLine, Plus } from "lucide-react";
import { Toaster, toast } from "sonner";
import { MAX_ACTIVE, type Lane, type ViewId } from "@/lib/atelier";
import { useAtelier } from "@/lib/store";
import { cn, isoDay } from "@/lib/utils";
import { ActivityWeek } from "./activity-week";
import { CaptureBar } from "./capture-bar";
import { NewWorkDialog } from "./new-work-dialog";
import { Overview, WorkList } from "./overview";
import { ParkDialog } from "./park-dialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { TooltipProvider } from "./ui/tooltip";
import { WorkSheet } from "./work-sheet";

const NAV: { id: ViewId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "board", label: "總覽", icon: LayoutGrid },
  { id: "active", label: "進行中", icon: Layers },
  { id: "pool", label: "靈感池", icon: PenLine },
];

export function AtelierApp() {
  const works = useAtelier((s) => s.works);
  const focus = useAtelier((s) => s.focus);
  const view = useAtelier((s) => s.view);
  const openId = useAtelier((s) => s.openId);
  const setView = useAtelier((s) => s.setView);
  const setOpenId = useAtelier((s) => s.setOpenId);
  const captureIdea = useAtelier((s) => s.captureIdea);
  const createWork = useAtelier((s) => s.createWork);
  const addNote = useAtelier((s) => s.addNote);
  const setFocus = useAtelier((s) => s.setFocus);
  const completeFocus = useAtelier((s) => s.completeFocus);
  const parkOneThenActivate = useAtelier((s) => s.parkOneThenActivate);
  const resetDemo = useAtelier((s) => s.resetDemo);

  const [newOpen, setNewOpen] = useState(false);
  const [newLane, setNewLane] = useState<Lane>("pool");
  const [pendingActivate, setPendingActivate] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    function finish() {
      const s = useAtelier.getState();
      const today = isoDay();
      if (!s.focus.date) {
        useAtelier.setState({ focus: { workId: s.focus.workId, date: today } });
      } else if (s.focus.date !== today) {
        useAtelier.setState({ focus: { workId: null, date: today } });
      }
    }
    const unsub = useAtelier.persist.onFinishHydration(finish);
    void useAtelier.persist.rehydrate();
    if (useAtelier.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const openWork = works.find((w) => w.id === openId) ?? null;
  const active = useMemo(() => works.filter((w) => w.lane === "active"), [works]);
  const pool = useMemo(() => works.filter((w) => w.lane === "pool"), [works]);
  const parked = useMemo(() => works.filter((w) => w.lane === "parked"), [works]);
  const done = useMemo(() => works.filter((w) => w.lane === "done"), [works]);
  const today = isoDay();
  const focusWork =
    focus.workId && (focus.date === today || focus.date === "")
      ? (active.find((w) => w.id === focus.workId) ?? null)
      : null;
  const pendingWork = pendingActivate ? works.find((w) => w.id === pendingActivate) : null;

  function handleCreate(input: Parameters<typeof createWork>[0]) {
    const result = createWork(input);
    setNewOpen(false);
    if (result.id) setOpenId(result.id);
    if (!result.ok) {
      setPendingActivate(result.id ?? null);
      toast.message("進行中已滿", { description: "先停放一件，再把這件提上來。" });
    } else {
      toast.success(input.lane === "active" ? "已放進進行中" : "已丟進靈感池");
    }
  }

  function handleNeedPark(id: string) {
    setPendingActivate(id);
  }

  function exportJson() {
    const payload = JSON.stringify({ works, focus }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atelier-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("已匯出");
  }

  function handleIdea(text: string) {
    const id = captureIdea(text);
    toast.success("已丟進靈感池");
    setView("pool");
    setOpenId(id);
  }

  function handleLog(text: string) {
    if (!focusWork) return;
    addNote(focusWork.id, text, "win");
    toast.success("進度已記下");
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-dvh bg-bg pb-20 text-fg md:pb-36">
        <header className="sticky top-0 z-40 border-b border-border bg-bg/90">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
            <button
              type="button"
              onClick={() => setView("board")}
              className="flex items-baseline gap-2"
            >
              <span className="font-display text-xl font-medium tracking-tight">工坊</span>
              <span className="hidden text-xs tracking-wide text-subtle sm:inline">atelier</span>
            </button>
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={cn(
                    "h-10 rounded-md px-3 text-sm font-medium",
                    view === item.id ? "bg-raised text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setNewLane(view === "active" ? "active" : "pool");
                  setNewOpen(true);
                }}
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">新增</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="更多">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={exportJson}>匯出資料</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setResetOpen(true)}>還原示範工坊</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 md:hidden">
            <CaptureBar canLog={!!focusWork} onIdea={handleIdea} onLog={handleLog} />
          </div>
          {view === "board" ? (
            <Overview
              works={works}
              focusWork={focusWork}
              onOpen={setOpenId}
              onCompleteFocus={() => {
                completeFocus();
                toast.success("記下了。下一步是什麼，寫在項目裡。");
              }}
              onChangeFocus={() => setView("active")}
              onSeeActive={() => setView("active")}
              onSeePool={() => setView("pool")}
              onPickFocus={(id) => {
                setFocus(id);
                toast.success("今天就推這一件");
              }}
            />
          ) : null}

          {view === "active" ? (
            <div className="space-y-10">
              <WorkList
                title="進行中"
                hint={`同時最多 ${MAX_ACTIVE} 件。沒有下一步的，先回到靈感池。`}
                works={active}
                empty="沒有進行中的項目。從靈感池提一件上來。"
                onOpen={setOpenId}
                onAdd={() => {
                  setNewLane("active");
                  setNewOpen(true);
                }}
                addLabel="新開一件"
              />
              {parked.length > 0 ? (
                <WorkList
                  title="停放"
                  hint="不是放棄，是現在不做。隨時可以撿回來。"
                  works={parked}
                  empty=""
                  onOpen={setOpenId}
                  onAdd={() => setView("pool")}
                  addLabel="去靈感池"
                />
              ) : null}
              {done.length > 0 ? (
                <WorkList
                  title="完成"
                  hint="做完的留著看，提醒自己不是一直在原地。"
                  works={done}
                  empty=""
                  onOpen={setOpenId}
                />
              ) : null}
            </div>
          ) : null}

          {view === "pool" ? (
            <div className="space-y-8">
              <WorkList
                title="靈感池"
                hint="想到就丟。火候還不夠，就不要佔用進行中的三個位子。"
                works={pool}
                empty="池子空了。下面那一欄隨時可以寫一句。"
                onOpen={setOpenId}
                onAdd={() => {
                  setNewLane("pool");
                  setNewOpen(true);
                }}
                addLabel="寫一則"
              />
              <ActivityWeek works={works} />
            </div>
          ) : null}
        </main>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden px-3 pb-5 md:block">
          <div className="pointer-events-auto mx-auto max-w-xl">
            <CaptureBar canLog={!!focusWork} onIdea={handleIdea} onLog={handleLog} />
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 md:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-3 pb-[env(safe-area-inset-bottom)]">
            {NAV.map((item) => {
              const Icon = item.icon;
              const on = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-0.5 text-xs",
                    on ? "text-fg" : "text-muted",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <WorkSheet work={openWork} onClose={() => setOpenId(null)} onNeedPark={handleNeedPark} />

        <NewWorkDialog
          open={newOpen}
          defaultLane={newLane}
          onClose={() => setNewOpen(false)}
          onCreate={handleCreate}
        />

        <ParkDialog
          open={!!pendingActivate}
          active={active}
          onClose={() => setPendingActivate(null)}
          onPark={(parkId) => {
            if (!pendingActivate) return;
            parkOneThenActivate(parkId, pendingActivate);
            setPendingActivate(null);
            toast.success("已調整位子");
          }}
        />

        {resetOpen ? (
          <ResetDialog
            onCancel={() => setResetOpen(false)}
            onConfirm={() => {
              resetDemo();
              setResetOpen(false);
              toast.success("已還原示範工坊");
            }}
          />
        ) : null}

        {pendingWork && pendingWork.lane !== "active" ? (
          <p className="sr-only">{pendingWork.title} 等待停放空位</p>
        ) : null}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "bg-surface text-fg shadow-[var(--shadow-lift)]",
            },
          }}
        />
      </div>
    </TooltipProvider>
  );
}

function ResetDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg/70 px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-[var(--shadow-lift)]">
        <h2 className="font-display text-xl font-medium tracking-tight">還原示範？</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          會清掉你在這個瀏覽器裡寫的項目與紀錄，換回一開始的示範工坊。
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            取消
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            還原
          </Button>
        </div>
      </div>
    </div>
  );
}
