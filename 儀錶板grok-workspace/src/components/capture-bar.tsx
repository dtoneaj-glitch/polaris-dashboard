import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function CaptureBar({
  onIdea,
  onLog,
  canLog,
}: {
  onIdea: (text: string) => void;
  onLog: (text: string) => void;
  canLog: boolean;
}) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"idea" | "log">("idea");

  function submit() {
    const t = text.trim();
    if (!t) return;
    if (mode === "log" && canLog) onLog(t);
    else onIdea(t);
    setText("");
  }

  return (
    <form
      className="flex items-center gap-1.5 rounded-xl bg-surface p-1.5 shadow-[var(--shadow-lift)]"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="flex shrink-0 gap-0.5 pl-1">
        <button
          type="button"
          onClick={() => setMode("idea")}
          className={cn(
            "h-11 rounded-full px-3 text-xs font-medium",
            mode === "idea" ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
          )}
        >
          靈感
        </button>
        <button
          type="button"
          onClick={() => canLog && setMode("log")}
          disabled={!canLog}
          className={cn(
            "h-11 rounded-full px-3 text-xs font-medium disabled:opacity-40",
            mode === "log" ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
          )}
        >
          進度
        </button>
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={mode === "log" ? "今天做了哪一件小事…" : "一句發想，先丟進池裡…"}
        className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-fg outline-none placeholder:text-subtle"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!text.trim()}
        aria-label={mode === "log" ? "記錄進度" : "丟進靈感池"}
      >
        <ArrowUp />
      </Button>
    </form>
  );
}
