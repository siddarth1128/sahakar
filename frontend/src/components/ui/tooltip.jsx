import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "../../lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = React.forwardRef(({ delayDuration = 0, skipDelayDuration = 0, ...props }, ref) => (
  <TooltipPrimitive.Root
    ref={ref}
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    {...props}
  />
))
Tooltip.displayName = TooltipPrimitive.Root.displayName

const TooltipTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TooltipPrimitive.Trigger ref={ref} className={className} {...props} />
))
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:md:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=left]:md:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=right]:md:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=top]:md:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }