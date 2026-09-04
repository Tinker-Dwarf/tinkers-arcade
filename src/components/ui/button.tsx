import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        ember: "bg-ember text-ink hover:bg-ember-2",
        steel: "border border-steel/40 bg-soot text-bone hover:border-steel-2/60 hover:bg-coal-2",
        ghost: "text-steel hover:text-bone",
      },
      size: {
        md: "h-11 px-5",
        lg: "h-12 px-6",
        sm: "h-9 px-3 text-[0.65rem]",
      },
    },
    defaultVariants: { variant: "ember", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
