import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Bottom-right, stacked, auto-dismiss 3.6s — per the handoff spec.
 * Light mode only; the design has no dark theme.
 */
function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      duration={3600}
      closeButton
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "!bg-card !border-border !rounded-lg !shadow-toast !min-w-[280px] !max-w-[360px] !font-sans",
          title: "!text-[13px] !font-semibold !text-foreground",
          description: "!text-[12px] !text-muted-foreground",
          icon: "!text-teal-600",
          closeButton: "!bg-card !border-border !text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
