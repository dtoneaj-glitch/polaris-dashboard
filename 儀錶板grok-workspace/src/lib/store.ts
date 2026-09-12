import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type AtelierState,
  type Category,
  type Energy,
  type Lane,
  type NoteKind,
  type ViewId,
  type Work,
  MAX_ACTIVE,
  makeWork,
  seedState,
} from "./atelier";
import { isoDay, nid } from "./utils";

export type ActivateResult =
  | { ok: true }
  | { ok: false; code: "max-active"; active: Work[] };

interface AtelierStore extends AtelierState {
  view: ViewId;
  openId: string | null;
  setView: (view: ViewId) => void;
  setOpenId: (id: string | null) => void;
  captureIdea: (title: string, extra?: { body?: string; category?: Category; energy?: Energy }) => string;
  createWork: (input: {
    title: string;
    intent?: string;
    category?: Category;
    lane?: Lane;
    energy?: Energy;
    nextAction?: string;
  }) => ActivateResult & { id?: string };
  updateWork: (id: string, patch: Partial<Pick<Work, "title" | "intent" | "category" | "energy" | "nextAction">>) => void;
  setLane: (id: string, lane: Lane) => ActivateResult;
  addMilestone: (id: string, title: string) => void;
  toggleMilestone: (workId: string, milestoneId: string) => void;
  removeMilestone: (workId: string, milestoneId: string) => void;
  addNote: (id: string, body: string, kind?: NoteKind) => void;
  removeNote: (workId: string, noteId: string) => void;
  setFocus: (workId: string | null) => void;
  completeFocus: () => void;
  removeWork: (id: string) => void;
  parkOneThenActivate: (parkId: string, activateId: string) => void;
  resetDemo: () => void;
}

function touch(work: Work, extra: Partial<Work> = {}): Work {
  const now = Date.now();
  return { ...work, ...extra, updatedAt: now, lastTouchAt: now };
}

export const useAtelier = create<AtelierStore>()(
  persist(
    (set, get) => ({
      ...seedState(),
      view: "board",
      openId: null,

      setView: (view) => set({ view }),
      setOpenId: (openId) => set({ openId }),

      captureIdea: (title, extra) => {
        const work = makeWork({
          title: title.trim(),
          intent: extra?.body?.trim() ?? "",
          category: extra?.category ?? "other",
          lane: "pool",
          energy: extra?.energy ?? "spark",
          notes: extra?.body?.trim()
            ? [{ body: extra.body.trim(), kind: "idea" }]
            : [],
        });
        set({ works: [work, ...get().works] });
        return work.id;
      },

      createWork: (input) => {
        const lane = input.lane ?? "pool";
        const work = makeWork({
          title: input.title.trim(),
          intent: input.intent?.trim() ?? "",
          category: input.category ?? "other",
          lane: lane === "active" ? "pool" : lane,
          energy: input.energy ?? (lane === "active" ? "hot" : "spark"),
          nextAction: input.nextAction?.trim() ?? "",
        });
        set({ works: [work, ...get().works] });
        if (lane === "active") {
          const result = get().setLane(work.id, "active");
          return { ...result, id: work.id };
        }
        return { ok: true, id: work.id };
      },

      updateWork: (id, patch) => {
        set({
          works: get().works.map((w) =>
            w.id === id
              ? touch(w, {
                  ...patch,
                  title: patch.title?.trim() ?? w.title,
                  intent: patch.intent !== undefined ? patch.intent.trim() : w.intent,
                  nextAction:
                    patch.nextAction !== undefined ? patch.nextAction.trim() : w.nextAction,
                })
              : w,
          ),
        });
      },

      setLane: (id, lane) => {
        const works = get().works;
        const target = works.find((w) => w.id === id);
        if (!target) return { ok: true };
        if (lane === "active") {
          const active = works.filter((w) => w.lane === "active" && w.id !== id);
          if (active.length >= MAX_ACTIVE) {
            return { ok: false, code: "max-active", active };
          }
        }
        set({
          works: works.map((w) => (w.id === id ? touch(w, { lane, energy: lane === "active" ? "hot" : w.energy }) : w)),
          focus:
            lane !== "active" && get().focus.workId === id
              ? { workId: null, date: isoDay() }
              : get().focus,
        });
        return { ok: true };
      },

      addMilestone: (id, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        set({
          works: get().works.map((w) =>
            w.id === id
              ? touch(w, {
                  milestones: [...w.milestones, { id: nid(), title: trimmed, done: false }],
                })
              : w,
          ),
        });
      },

      toggleMilestone: (workId, milestoneId) => {
        set({
          works: get().works.map((w) => {
            if (w.id !== workId) return w;
            return touch(w, {
              milestones: w.milestones.map((m) =>
                m.id === milestoneId
                  ? { ...m, done: !m.done, doneAt: !m.done ? Date.now() : undefined }
                  : m,
              ),
            });
          }),
        });
      },

      removeMilestone: (workId, milestoneId) => {
        set({
          works: get().works.map((w) =>
            w.id === workId
              ? { ...w, milestones: w.milestones.filter((m) => m.id !== milestoneId), updatedAt: Date.now() }
              : w,
          ),
        });
      },

      addNote: (id, body, kind = "log") => {
        const trimmed = body.trim();
        if (!trimmed) return;
        set({
          works: get().works.map((w) =>
            w.id === id
              ? touch(w, {
                  notes: [{ id: nid(), body: trimmed, kind, createdAt: Date.now() }, ...w.notes],
                })
              : w,
          ),
        });
      },

      removeNote: (workId, noteId) => {
        set({
          works: get().works.map((w) =>
            w.id === workId ? { ...w, notes: w.notes.filter((n) => n.id !== noteId), updatedAt: Date.now() } : w,
          ),
        });
      },

      setFocus: (workId) => set({ focus: { workId, date: isoDay() } }),

      completeFocus: () => {
        const { focus, works, addNote, setFocus } = get();
        const today = isoDay();
        if (!focus.workId || (focus.date && focus.date !== today && focus.date !== "")) return;
        const work = works.find((w) => w.id === focus.workId);
        if (!work) return;
        const line = work.nextAction
          ? `完成今日焦點：${work.nextAction}`
          : "完成今日焦點";
        addNote(work.id, line, "win");
        setFocus(null);
      },

      removeWork: (id) => {
        set({
          works: get().works.filter((w) => w.id !== id),
          openId: get().openId === id ? null : get().openId,
          focus: get().focus.workId === id ? { workId: null, date: isoDay() } : get().focus,
        });
      },

      parkOneThenActivate: (parkId, activateId) => {
        set({
          works: get().works.map((w) => {
            if (w.id === parkId) return touch(w, { lane: "parked" });
            if (w.id === activateId) return touch(w, { lane: "active", energy: "hot" });
            return w;
          }),
          focus:
            get().focus.workId === parkId ? { workId: null, date: isoDay() } : get().focus,
        });
      },

      resetDemo: () => {
        const seeded = seedState();
        set({
          works: seeded.works,
          focus: { workId: seeded.focus.workId, date: isoDay() },
          openId: null,
          view: "board",
        });
      },
    }),
    {
      name: "atelier-v1",
      skipHydration: true,
      partialize: (state) => ({
        works: state.works,
        focus: state.focus,
      }),
    },
  ),
);

