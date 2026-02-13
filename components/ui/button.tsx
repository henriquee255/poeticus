"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
// Note: I am assuming class-variance-authority and radix-ui/react-slot might be needed, 
// but I didn't install them yet. I will install them next if I use them.
// For now, let's keep it simple without CVA/Slot if possible, or add them to install list.
// Actually, standard shadcn uses them. I'll use simple props for now to avoid extra deps if not installed yet.
// Wait, I can just use simple logic without CVA for now to reduce dependencies, or add them.
// Let's add them to the install list or just handle classes manually.
// Manual is fine for a few variants.

// Re-evaluating: CVA is great. I should adding it to the install list.
// For now, I'll write the code assuming CVA is available or I can simulate it. 
// Let's simulate it with simple object mapping or functions to be safe? 
// No, let's just use standard clsx/tailwind-merge.

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "link" | "glow"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
            outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            glow: "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(46,2,73,0.5)] hover:shadow-[0_0_30px_rgba(87,10,87,0.7)] transition-shadow duration-300 border border-secondary/50"
        }

        const sizes = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-10 rounded-md px-8",
            icon: "h-9 w-9"
        }

        const Comp = motion.button

        return (
            <Comp
                ref={ref as any}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                {...(props as any)}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
