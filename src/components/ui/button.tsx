import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:pointer-events-none disabled:opacity-40 h-11 px-5",
  {
    variants: {
      variant: {
        ember: "bg-ember text-ink hover:bg-ember-2",
        steel: "border border-steel/40 bg-soot text-bone hover:border-steel-2/60 hover:bg-coal-2",
      },
    },
    defaultVariants: { variant: "ember" },
  },
);

export function Button({
  className,
  variant,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
