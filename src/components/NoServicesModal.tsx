import { AlertTriangle, Plus } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function NoServicesModal() {
  const noSvcPrompt = useAppStore((s) => s.noSvcPrompt);
  const jobs = useAppStore((s) => s.jobs);
  const closeNoSvc = useAppStore((s) => s.closeNoSvc);
  const noSvcAddServices = useAppStore((s) => s.noSvcAddServices);

  const job = jobs.find((j) => j.id === noSvcPrompt?.jobId);
  const rowLabel =
    job && job.equipment.length > 1 ? `${job.id}-${(noSvcPrompt?.eqIdx ?? 0) + 1}` : noSvcPrompt?.jobId;

  return (
    <Dialog open={!!noSvcPrompt} onOpenChange={(open) => !open && closeNoSvc()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="bg-orange/10 text-orange border-orange/20 flex size-9 shrink-0 items-center justify-center rounded-lg border">
              <AlertTriangle className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle>No services added</DialogTitle>
              <DialogDescription>{rowLabel} can't be moved yet</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <p className="text-muted-foreground m-0 text-sm leading-relaxed">
          This equipment has no services added yet. Add services before moving it out of Drop offs Booked.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={closeNoSvc}>
            Cancel
          </Button>
          <Button onClick={noSvcAddServices}>
            <Plus />
            Add services
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
