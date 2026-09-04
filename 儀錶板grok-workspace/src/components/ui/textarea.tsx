import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full rounded-md bg-raised px-3 py-2.5 text-sm text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle",
        "focus-visible:ring-2 focus-visible:ring-ring/70",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
