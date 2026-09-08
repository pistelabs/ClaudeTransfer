import { Mail, MessageSquare } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerDialog() {
  const addCustOpen = useAppStore((s) => s.addCustOpen);
  const editCustId = useAppStore((s) => s.editCustId);
  const ncust = useAppStore((s) => s.ncust);
  const patchNcust = useAppStore((s) => s.patchNcust);
  const closeAddCust = useAppStore((s) => s.closeAddCust);
  const addCustomer = useAppStore((s) => s.addCustomer);

  const canSave = ncust.first.trim().length > 0 && ncust.last.trim().length > 0;

  return (
    <Dialog open={addCustOpen} onOpenChange={(open) => !open && closeAddCust()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{editCustId ? "Edit customer" : "Add a customer"}</DialogTitle>
          <DialogDescription>
            {editCustId
              ? "Update the customer's information below."
              : "Enter the customer's information below."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cust-first">First name</Label>
            <Input
              id="cust-first"
              value={ncust.first}
              onChange={(e) => patchNcust({ first: e.target.value })}
              placeholder="Jane"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cust-last">Last name</Label>
            <Input
              id="cust-last"
              value={ncust.last}
              onChange={(e) => patchNcust({ last: e.target.value })}
              placeholder="Doe"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cust-email">Email address</Label>
            <Input
              id="cust-email"
              value={ncust.email}
              onChange={(e) => patchNcust({ email: e.target.value })}
              placeholder="jane@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cust-phone">Phone number</Label>
            <Input
              id="cust-phone"
              value={ncust.phone}
              onChange={(e) => patchNcust({ phone: e.target.value })}
              placeholder="(604) 555-0100"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Preferred contact channel</Label>
          <div className="flex gap-3">
            <Button
              variant={ncust.channel === "Email" ? "default" : "outline"}
              onClick={() => patchNcust({ channel: "Email" })}
              className="flex-1"
            >
              <Mail />
              Email
            </Button>
            <Button
              variant={ncust.channel === "SMS" ? "default" : "outline"}
              onClick={() => patchNcust({ channel: "SMS" })}
              className="flex-1"
            >
              <MessageSquare />
              SMS
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeAddCust}>
            Cancel
          </Button>
          <Button onClick={addCustomer} disabled={!canSave}>
            {editCustId ? "Save changes" : "Add customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
