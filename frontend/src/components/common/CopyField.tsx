import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface CopyFieldProps {
  url: string;
  /** Shown in the toast when the link is copied. */
  toastTitle: string;
  toastDescription?: string;
  showVisit?: boolean;
}

/** URL in a muted field, a Copy/Copied button, and an optional Visit link. */
export function CopyField({
  url,
  toastTitle,
  toastDescription,
  showVisit = false,
}: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`https://${url}`);
      setCopied(true);
      toast.success(toastTitle, { description: toastDescription ?? url });
    } catch {
      toast.error("Could not copy the link", {
        description: "Copy it manually from the field.",
      });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="bg-muted border-border text-muted-foreground flex h-9 min-w-0 flex-1 items-center truncate rounded-md border px-3 text-[13px]">
        {url}
      </div>
      <Button variant="outline" size="sm" className="h-9" onClick={handleCopy}>
        {copied ? (
          <>
            <CheckIcon className="text-teal-600" /> Copied
          </>
        ) : (
          <>
            <CopyIcon /> Copy
          </>
        )}
      </Button>
      {showVisit && (
        <a
          href={`https://${url}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:text-primary-hover inline-flex h-9 items-center gap-1.5 px-1 text-[13px] font-semibold"
        >
          Visit
          <ExternalLinkIcon className="size-3.5" />
        </a>
      )}
    </div>
  );
}
