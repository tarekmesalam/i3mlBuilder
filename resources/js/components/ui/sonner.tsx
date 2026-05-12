"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTranslation } from "@/contexts/LanguageContext"

function Toaster({ ...props }: ToasterProps) {
  const { isRtl } = useTranslation();

  return (
    <Sonner
      position={isRtl ? "top-left" : "top-right"}
      dir={isRtl ? "rtl" : "ltr"}
      className="toaster group"
      richColors
      closeButton
      expand={false}
      visibleToasts={4}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:backdrop-blur-sm",
          title: "group-[.toast]:font-medium",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:transition-colors",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
