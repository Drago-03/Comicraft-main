import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white border-[3px] border-black shadow-[4px_4px_0_0_#cc3333] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#cc3333] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#cc3333]",
        destructive:
          "bg-white text-black border-[3px] border-black shadow-[4px_4px_0_0_#cc3333] hover:bg-[#EEDFCA] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#cc3333] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#cc3333]",
        outline:
          "border-[3px] border-black bg-white shadow-[4px_4px_0_0_#000] hover:bg-[#EEDFCA] text-black hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]",
        secondary:
          "bg-[#cc3333] text-white border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:bg-[#e63946] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]",
        ghost: "hover:bg-[#EEDFCA] hover:text-black hover:border-black border-[3px] border-transparent",
        link: "text-black underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-none px-4 text-xs",
        lg: "h-12 rounded-none px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
