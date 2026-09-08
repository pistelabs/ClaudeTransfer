import { ChevronRight } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Avatar } from "../Pills";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function StaffSelectorModal() {
  const staffPrompt = useAppStore((s) => s.staffPrompt);
  const editId = useAppStore((s) => s.editId);
  const staffList = useAppStore((s) => s.staffList);
  const setStaff = useAppStore((s) => s.setStaff);

  return (
    <Dialog open={!!staffPrompt}>
      {/* Picking a name is required, so this one has no way out: no close button, and
       * Escape and outside clicks are ignored. */}
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-[400px]"
      >
        <DialogHeader>
          <DialogTitle>{editId ? "Who's editing?" : "Who's checking in?"}</DialogTitle>
          <DialogDescription>Select your name to attach it to this job.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          {staffList.map((name) => (
            <button
              key={name}
              onClick={() => setStaff(name)}
              className="hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-lg border p-2.5 text-left outline-none focus-visible:ring-[3px]"
            >
              <Avatar name={name} />
              <span className="flex-1 text-sm font-semibold">{name}</span>
              <ChevronRight className="text-muted-foreground size-4" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
