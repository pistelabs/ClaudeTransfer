import { Check } from "lucide-react";
import type { Job } from "../../types";
import { useAppStore } from "../../store/useAppStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function UpdatesPanel({ job }: { job: Job }) {
  const draft = useAppStore((s) => s.draft);
  const setDraft = useAppStore((s) => s.setDraft);
  const addUpdate = useAppStore((s) => s.addUpdate);

  return (
    <div className="flex flex-col gap-[11px] rounded-xl border bg-white p-4">
      <span className="text-[13.5px] font-semibold tracking-tight">Updates &amp; Notes</span>
      {job.updates.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {job.updates.map((u, i) => {
            const activeHold = u.hold && !u.resolved;
            return (
              <div
                key={i}
                className={cn(
                  "flex gap-2.5 rounded-lg border px-3 py-2",
                  activeHold ? "border-amber-200 bg-amber-50" : "bg-surface-50",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] leading-relaxed text-zinc-800">{u.text}</div>
                  <div className="text-muted-foreground mt-[3px] flex flex-wrap items-center gap-1.5 text-[10.5px]">
                    <span>{u.at}</span>
                    {u.hold && u.resolved && (
                      <Badge
                        variant="outline"
                        className="gap-1 rounded-full border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[10.5px] text-emerald-700"
                      >
                        <Check size={9} strokeWidth={3} />
                        Resolved · {u.resolvedAt}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add update or note..."
        className="min-h-[74px] resize-y bg-white"
      />
      <Button onClick={addUpdate} disabled={!draft.trim()} size="sm" className="self-start">
        Add Update
      </Button>
    </div>
  );
}
