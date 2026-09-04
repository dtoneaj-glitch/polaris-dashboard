import { CATEGORY_LABEL, type Category } from "@/lib/atelier";
import { cn } from "@/lib/utils";

const ORDER: Category[] = ["music", "drama", "novel", "tool", "venture", "other"];

export function CategorySelect({
  value,
  onChange,
}: {
  value: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ORDER.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "h-9 rounded-full px-3 text-xs font-medium transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.96]",
            value === c ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg",
          )}
        >
          {CATEGORY_LABEL[c]}
        </button>
      ))}
    </div>
  );
}
