import { MAX_ACTIVE, type Work } from "@/lib/atelier";
import { touchLabel } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function ParkDialog({
  open,
  active,
  onPark,
  onClose,
}: {
  open: boolean;
  active: Work[];
  onPark: (parkId: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>先停放一件</DialogTitle>
          <DialogDescription>
            進行中最多 {MAX_ACTIVE} 件。同時開太多，每件都會變慢。選一件先放到旁邊，不是放棄。
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {active.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => onPark(w.id)}
                className="flex w-full items-center justify-between rounded-md bg-raised px-3 py-3 text-left hover:bg-raised/70"
              >
                <span className="font-medium text-fg">{w.title}</span>
                <span className="text-xs text-muted">{touchLabel(w.lastTouchAt)}</span>
              </button>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            先不要
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
