"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { AnimatePresence, motion } from "framer-motion"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      <AnimatePresence>
        {toasts.map(({ id, title, description, action, neonColor, gradientFrom, gradientTo, ...props }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          >
            <Toast 
              {...props}
              neonColor={neonColor}
              gradientFrom={gradientFrom}
              gradientTo={gradientTo}
            >
              <div className="grid gap-1">
                {title && <ToastTitle className="text-lg font-semibold">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose className="absolute top-2 right-2 rounded-full p-1 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-300" />
            </Toast>
          </motion.div>
        ))}
      </AnimatePresence>
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-full max-w-sm" />
    </ToastProvider>
  )
}
