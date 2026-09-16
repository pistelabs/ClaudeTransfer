import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/** The uppercase label that sits above every form field group. */
export function FieldLabel({
  className,
  ...props
}: ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn(
        "text-tertiary-foreground text-[11px] font-semibold tracking-[0.4px] uppercase",
        className,
      )}
      {...props}
    />
  );
}
