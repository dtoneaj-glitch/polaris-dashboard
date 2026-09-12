import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      tone: {
        mute: "bg-raised text-muted",
        alive: "bg-alive/15 text-alive",
        warn: "bg-warn/15 text-warn",
        danger: "bg-danger/15 text-danger",
        paper: "bg-accent/10 text-accent",
      },
    },
    defaultVariants: { tone: "mute" },
  },
);

function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
