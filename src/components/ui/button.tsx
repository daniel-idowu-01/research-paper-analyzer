import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-300 text-slate-950 shadow-xs hover:bg-cyan-200 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-cyan-300/50 bg-transparent text-cyan-200 shadow-xs hover:border-cyan-300 hover:bg-cyan-300 hover:text-slate-950 dark:border-cyan-300/50 dark:bg-transparent dark:text-cyan-200 dark:hover:bg-cyan-300 dark:hover:text-slate-950",
        secondary:
          "bg-cyan-300 text-slate-950 shadow-xs hover:bg-cyan-200 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200",
        ghost:
          "text-cyan-100 hover:bg-cyan-300/15 hover:text-cyan-100 dark:text-cyan-100 dark:hover:bg-cyan-300/15",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
