import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      duration={4500}
      closeButton
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--toast-background)",
          "--normal-text": "var(--toast-foreground)",
          "--normal-border": "var(--toast-background)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !pr-12",
          description: "!text-toast-foreground/75",
          closeButton: "!left-auto !right-3 !top-1/2 !transform-none !-translate-y-1/2 !size-6 !rounded-md !border-0 !bg-transparent !text-toast-foreground hover:!bg-toast-foreground/15",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
