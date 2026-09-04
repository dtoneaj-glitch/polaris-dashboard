import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 transition-[scale,background-color,color,box-shadow,opacity] duration-150 ease-out active:not-disabled:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:bg-accent/90",
        secondary:
          "bg-raised text-fg shadow-[var(--shadow-border)] hover:bg-raised/80",
        ghost: "text-fg hover:bg-raised",
        outline:
          "text-fg shadow-[var(--shadow-border)] hover:bg-raised",
        danger: "bg-danger/15 text-danger hover:bg-danger/25",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-4",
        lg: "h-12 px-5",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
