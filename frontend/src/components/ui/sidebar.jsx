import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const sidebarVariants = cva(
  "flex flex-col h-full bg-background border-r",
  {
    variants: {
      variant: {
        default: "w-64",
        collapsible: "w-16",
        floating: "w-16",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Sidebar = React.forwardRef(({ className, variant = "default", collapsible, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn(sidebarVariants({ variant, className }))}
    {...props}
  />
))
Sidebar.displayName = "Sidebar"

const SidebarProvider = ({ children }) => (
  <React.Fragment>
    {children}
  </React.Fragment>
)
SidebarProvider.displayName = "SidebarProvider"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2 py-4", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarInset = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1", className)} {...props} />
))
SidebarInset.displayName = "SidebarInset"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2 p-2", className)} {...props} />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-auto p-2", className)} {...props} />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-1 text-xs font-semibold uppercase text-muted-foreground", className)} {...props} />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-2 my-2 h-px bg-border", className)} {...props} />
))
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <nav ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(({ className, children, icon, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
      className
    )}
    {...props}
  >
    {icon}
    <span>{children}</span>
  </button>
))
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute -right-4 top-8 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background p-0 text-sidebar-foreground ring-offset-background transition-transform hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
  >
    <ChevronRight className="h-4 w-4" />
  </button>
))
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-full w-1 bg-border", className)} {...props} />
))
SidebarRail.displayName = "SidebarRail"

export {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarInset,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
}