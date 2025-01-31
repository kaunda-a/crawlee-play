"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@/lib/utils"

const Drawer = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Root> & {
    shouldScaleBackground?: boolean
    overlayClassName?: string
  }
>(({ shouldScaleBackground = true, overlayClassName, ...props }, ref) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  >
    {props.children}
  </DrawerPrimitive.Root>
))
Drawer.displayName = "Drawer"

const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Trigger
    ref={ref}
    className={cn("cursor-pointer", className)}
    {...props}
  />
))
DrawerTrigger.displayName = "DrawerTrigger"

const DrawerPortal = DrawerPrimitive.Portal
const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay> & {
    opacity?: number
  }
>(({ className, opacity = 0.8, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(`fixed inset-0 z-50 bg-black/[${opacity}]`, className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    roundedCorners?: string
    transition?: string
    neonColor?: string
    gradientFrom?: string
    gradientTo?: string
  }
>(({ 
  className, 
  children, 
  roundedCorners = "20px", 
  transition = "all 0.3s ease-in-out", 
  neonColor = "#00f3ff",
  gradientFrom = "rgba(255, 255, 255, 0.1)",
  gradientTo = "rgba(255, 255, 255, 0.05)",
  ...props 
}, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        `fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col 
        rounded-t-[${roundedCorners}] 
        border border-[${neonColor}] 
        bg-gradient-to-b from-[${gradientFrom}] to-[${gradientTo}] 
        backdrop-blur-md
        shadow-[0_0_10px_${neonColor}]
        transition-${transition}`,
        className
      )}
      style={{
        boxShadow: `0 0 10px ${neonColor}, 0 0 20px ${neonColor}`,
      }}
      {...props}
    >
      <div className={`mx-auto mt-4 h-2 w-[100px] rounded-full bg-[${neonColor}]`} />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withDivider?: boolean }
>(({ className, withDivider = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid gap-1.5 p-4 text-center sm:text-left",
      withDivider && "border-b",
      className
    )}
    {...props}
  />
))
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withDivider?: boolean }
>(({ className, withDivider = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto flex flex-col gap-2 p-4",
      withDivider && "border-t",
      className
    )}
    {...props}
  />
))
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
