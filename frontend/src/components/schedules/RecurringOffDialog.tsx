import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RecurringOffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Skip this week only, keeping the series. */
  onSkipWeek: () => void;
  /** Turn the recurrence off for every week. */
  onTurnOffRecurring: () => void;
}

/**
 * Toggling off a recurring block asks which one the manager means before
 * anything changes.
 */
export function RecurringOffDialog({
  open,
  onOpenChange,
  onSkipWeek,
  onTurnOffRecurring,
}: RecurringOffDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Turn off this time block?</DialogTitle>
          <DialogDescription>
            This block repeats every week. Choose how far the change should go.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 sm:justify-between">
          <Button variant="outline" onClick={onSkipWeek}>
            This week only
          </Button>
          <Button onClick={onTurnOffRecurring}>Turn off recurring</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
