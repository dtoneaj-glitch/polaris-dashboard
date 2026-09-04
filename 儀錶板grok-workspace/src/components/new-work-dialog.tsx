import { useEffect, useState } from "react";
import { type Category, type Lane } from "@/lib/atelier";
import { CategorySelect } from "./category-select";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";

export function NewWorkDialog({
  open,
  defaultLane,
  onClose,
  onCreate,
}: {
  open: boolean;
  defaultLane: Lane;
  onClose: () => void;
  onCreate: (input: {
    title: string;
    intent: string;
    category: Category;
    lane: Lane;
    nextAction: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [intent, setIntent] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [lane, setLane] = useState<Lane>(defaultLane);

  useEffect(() => {
    if (open) setLane(defaultLane);
  }, [open, defaultLane]);

  function reset() {
    setTitle("");
    setIntent("");
    setNextAction("");
    setCategory("other");
    setLane(defaultLane);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            onCreate({ title, intent, category, lane, nextAction });
            reset();
          }}
        >
          <DialogHeader>
            <DialogTitle>{lane === "pool" ? "丟進靈感池" : "開一件進行中"}</DialogTitle>
            <DialogDescription>
              {lane === "pool"
                ? "還沒決定做不做。先寫下來，就不會佔用今天的注意力。"
                : "進行中要有下一步。沒有下一步，就還只是靈感。"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1.5">
            {(["pool", "active"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLane(l)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-medium",
                  lane === l ? "bg-accent text-accent-fg" : "bg-raised text-muted",
                )}
              >
                {l === "pool" ? "靈感池" : "進行中"}
              </button>
            ))}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-title">名稱</Label>
            <Input
              id="new-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="短、具體"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-intent">為什麼（選填）</Label>
            <Textarea
              id="new-intent"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="這件事對你來說，真正想解決的是什麼"
              rows={2}
            />
          </div>
          {lane === "active" ? (
            <div className="grid gap-2">
              <Label htmlFor="new-next">下一步</Label>
              <Input
                id="new-next"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="小到今天做得出來"
              />
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label>類型</Label>
            <CategorySelect value={category} onChange={setCategory} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              放進去
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
