import { isoDay, nid } from "./utils";

export type Lane = "active" | "pool" | "parked" | "done";
export type Energy = "spark" | "warm" | "hot";
export type Category = "music" | "drama" | "novel" | "tool" | "venture" | "other";
export type NoteKind = "log" | "win" | "idea";
export type ViewId = "board" | "active" | "pool";

export const MAX_ACTIVE = 3;

export const CATEGORY_LABEL: Record<Category, string> = {
  music: "音樂",
  drama: "短劇",
  novel: "小說",
  tool: "工具",
  venture: "創業",
  other: "其他",
};

export const LANE_LABEL: Record<Lane, string> = {
  active: "進行中",
  pool: "靈感池",
  parked: "停放",
  done: "完成",
};

export const ENERGY_LABEL: Record<Energy, string> = {
  spark: "微火",
  warm: "溫火",
  hot: "旺火",
};

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  doneAt?: number;
}

export interface Note {
  id: string;
  body: string;
  kind: NoteKind;
  createdAt: number;
}

export interface Work {
  id: string;
  title: string;
  intent: string;
  category: Category;
  lane: Lane;
  energy: Energy;
  nextAction: string;
  createdAt: number;
  updatedAt: number;
  lastTouchAt: number;
  milestones: Milestone[];
  notes: Note[];
}

export interface Focus {
  workId: string | null;
  date: string;
}

export interface AtelierState {
  works: Work[];
  focus: Focus;
}

export const IDS = {
  suno: "w-suno",
  drama: "w-drama",
  tools: "w-tools",
  novel: "w-novel",
  venture: "w-venture",
  shortfilm: "w-shortfilm",
} as const;

function daysAgo(n: number) {
  return Date.now() - n * 86_400_000;
}

export function progressOf(work: Work) {
  if (work.milestones.length === 0) return 0;
  return work.milestones.filter((m) => m.done).length / work.milestones.length;
}

export function quietDays(work: Work, now = Date.now()) {
  const start = (ts: number) => {
    const d = new Date(ts);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };
  return Math.max(0, Math.round((start(now) - start(work.lastTouchAt)) / 86_400_000));
}

export function quietStatus(work: Work, now = Date.now()) {
  const d = quietDays(work, now);
  if (d >= 14) return "stalled" as const;
  if (d >= 7) return "quiet" as const;
  return "alive" as const;
}

export function activityByDay(works: Work[], days = 14, now = Date.now()) {
  const start = (ts: number) => {
    const d = new Date(ts);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };
  const today = start(now);
  const map = new Map<number, number>();
  for (let i = days - 1; i >= 0; i--) map.set(today - i * 86_400_000, 0);

  for (const work of works) {
    for (const note of work.notes) {
      const key = start(note.createdAt);
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
    }
    for (const ms of work.milestones) {
      if (!ms.done || !ms.doneAt) continue;
      const key = start(ms.doneAt);
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return [...map.entries()].map(([day, count]) => ({ day, count }));
}

export function makeWork(partial: {
  id?: string;
  title: string;
  intent?: string;
  category?: Category;
  lane?: Lane;
  energy?: Energy;
  nextAction?: string;
  milestones?: Array<Partial<Milestone> & { title: string }>;
  notes?: Array<Partial<Note> & { body: string }>;
  lastTouchAt?: number;
  createdAt?: number;
}): Work {
  const now = Date.now();
  const createdAt = partial.createdAt ?? now;
  const notes: Note[] = (partial.notes ?? []).map((n) => ({
    id: n.id ?? nid(),
    body: n.body,
    kind: n.kind ?? "log",
    createdAt: n.createdAt ?? createdAt,
  }));
  const milestones: Milestone[] = (partial.milestones ?? []).map((m) => ({
    id: m.id ?? nid(),
    title: m.title,
    done: m.done ?? false,
    doneAt: m.doneAt,
  }));
  return {
    id: partial.id ?? nid(),
    title: partial.title,
    intent: partial.intent ?? "",
    category: partial.category ?? "other",
    lane: partial.lane ?? "pool",
    energy: partial.energy ?? "spark",
    nextAction: partial.nextAction ?? "",
    createdAt,
    updatedAt: now,
    lastTouchAt: partial.lastTouchAt ?? createdAt,
    milestones,
    notes,
  };
}

export function seedState(): AtelierState {
  const suno = makeWork({
    id: IDS.suno,
    title: "SUNO 音樂頻道",
    intent: "用 AI 音樂做出有辨識度的聲音，慢慢堆成一個頻道，而不是一次發一百首。",
    category: "music",
    lane: "active",
    energy: "hot",
    nextAction: "完成第一首可公開的曲目，並寫 80 字頻道簡介",
    lastTouchAt: daysAgo(2),
    createdAt: daysAgo(21),
    milestones: [
      { title: "頻道定位：深夜氛圍、少人聲", done: true, doneAt: daysAgo(18) },
      { title: "第一首成品可公開", done: false },
      { title: "上傳第一支影片", done: false },
      { title: "連續四週每週一首", done: false },
    ],
    notes: [
      {
        body: "聽了二十首參考。決定走深夜氛圍，人聲少一點，留空間給低頻。",
        kind: "log",
        createdAt: daysAgo(18),
      },
      {
        body: "Suno 出了兩版副歌，第二版比較有空間感，先鎖這個方向。",
        kind: "win",
        createdAt: daysAgo(2),
      },
    ],
  });

  const drama = makeWork({
    id: IDS.drama,
    title: "短劇實驗",
    intent: "先寫得出、拍得完的 90 秒，不先幻想劇集宇宙。",
    category: "drama",
    lane: "active",
    energy: "warm",
    nextAction: "寫一集 90 秒大綱：錯電梯",
    lastTouchAt: daysAgo(0),
    createdAt: daysAgo(12),
    milestones: [
      { title: "世界觀一頁", done: true, doneAt: daysAgo(9) },
      { title: "第一集腳本", done: false },
      { title: "分鏡八格", done: false },
      { title: "試拍一場", done: false },
    ],
    notes: [
      {
        body: "第一集：一個遲到的人走進錯的電梯，門打開是三年後。",
        kind: "idea",
        createdAt: daysAgo(9),
      },
      {
        body: "今天把角色動機寫清楚了：他不是穿越，是拒絕面對當天的會議。",
        kind: "win",
        createdAt: daysAgo(0),
      },
    ],
  });

  const tools = makeWork({
    id: IDS.tools,
    title: "AI 小工具賺錢",
    intent: "先找到一個願意付錢的人，再寫程式。不要從「我能做什麼」開始。",
    category: "tool",
    lane: "active",
    energy: "warm",
    nextAction: "列出三個有人真的在抱怨、且願意付錢的小痛點",
    lastTouchAt: daysAgo(8),
    createdAt: daysAgo(30),
    milestones: [
      { title: "選一個痛點", done: false },
      { title: "做出能用的 MVP", done: false },
      { title: "上線", done: false },
      { title: "第一個付費用戶", done: false },
    ],
    notes: [
      {
        body: "想過：幫創作者算分潤、幫小店寫上架文案、幫頻道切片。還沒選。",
        kind: "log",
        createdAt: daysAgo(16),
      },
      {
        body: "八天沒碰。不是題目不夠，是不敢收窄。",
        kind: "log",
        createdAt: daysAgo(8),
      },
    ],
  });

  const novel = makeWork({
    id: IDS.novel,
    title: "長篇小說",
    intent: "一個會遺忘自己寫過的故事的作家。先當靈感養著，未必要現在開工。",
    category: "novel",
    lane: "pool",
    energy: "warm",
    nextAction: "",
    lastTouchAt: daysAgo(5),
    createdAt: daysAgo(40),
    notes: [
      {
        body: "每次他寫完一章，隔天只記得情緒，不記得情節。讀者比他更早知道結局。",
        kind: "idea",
        createdAt: daysAgo(5),
      },
    ],
  });

  const venture = makeWork({
    id: IDS.venture,
    title: "創業方向",
    intent: "不一定要公司。先找一件值得每週投入十小時的事。",
    category: "venture",
    lane: "pool",
    energy: "spark",
    lastTouchAt: daysAgo(11),
    createdAt: daysAgo(45),
    notes: [
      {
        body: "創業現在比較像焦慮的代稱。先讓音樂或工具其中一件真的動起來。",
        kind: "idea",
        createdAt: daysAgo(11),
      },
    ],
  });

  const shortfilm = makeWork({
    id: IDS.shortfilm,
    title: "AI 配音短片",
    intent: "用現成畫面加配音，測一個會不會有人看完。",
    category: "drama",
    lane: "pool",
    energy: "spark",
    lastTouchAt: daysAgo(20),
    createdAt: daysAgo(20),
  });

  return {
    works: [suno, drama, tools, novel, venture, shortfilm],
    focus: { workId: IDS.drama, date: isoDay() },
  };
}
