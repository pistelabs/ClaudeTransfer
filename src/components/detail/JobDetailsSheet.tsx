import { useAppStore } from "../../store/useAppStore";
import { Avatar } from "../Pills";
import { EquipmentTabs } from "./EquipmentTabs";
import { LineItemsCard } from "./LineItemsCard";
import { UpdatesPanel } from "./UpdatesPanel";
import { WaiversPanel } from "./WaiversPanel";
import { PaymentBar } from "./PaymentBar";
import { HoldPromptModal, PayModals, ReadyPromptModal, ResolvePendingModal } from "./DetailModals";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

export function JobDetailsSheet() {
  const selectedId = useAppStore((s) => s.selectedId);
  const jobs = useAppStore((s) => s.jobs);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const closeDetail = useAppStore((s) => s.closeDetail);
  const editCustomerByName = useAppStore((s) => s.editCustomerByName);

  const job = jobs.find((j) => j.id === selectedId);
  if (!job) return null;

  const activeTabIdx = Math.max(0, Math.min(activeTab, job.equipment.length - 1));
  const isOverdue = job.status === "late";

  return (
    <Sheet open onOpenChange={(open) => !open && closeDetail()}>
      <SheetContent
        side="right"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[680px] gap-0 p-0 sm:max-w-[94vw]"
      >
        {/* Header */}
        <div className="border-app-bg flex shrink-0 flex-wrap items-center gap-2.5 border-b px-[18px] py-4 pr-12">
          <div className="flex min-w-0 flex-col gap-1">
            {/* Stacked so the label doesn't crowd the id, which is long now. */}
            <span className="text-muted-foreground text-[10.5px] font-semibold tracking-wide uppercase">Job ID</span>
            <SheetTitle className="-mt-0.5 text-base tracking-tight whitespace-nowrap">{job.id}</SheetTitle>
            <SheetDescription className="sr-only">
              Job details for {job.customer}: equipment, services, updates and payment.
            </SheetDescription>
            {isOverdue && (
              <Badge variant="outline" className="w-fit rounded-full border-red-200 bg-red-50 text-red-600">
                OVERDUE
              </Badge>
            )}
          </div>
          <button
            onClick={() => editCustomerByName(job.customer, job.email, job.phone)}
            title="Edit customer details"
            className="bg-surface-100 hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 flex min-w-0 items-center gap-[9px] rounded-full border py-[5px] pr-[13px] pl-[5px] text-left outline-none focus-visible:ring-[3px]"
          >
            <Avatar name={job.customer} size={34} />
            <div className="flex min-w-0 flex-col leading-[1.3]">
              <span className="text-[12.5px] font-semibold whitespace-nowrap">{job.customer}</span>
              <span className="text-muted-foreground max-w-[210px] overflow-hidden text-[11px] text-ellipsis whitespace-nowrap">
                {job.email} · {job.phone}
              </span>
            </div>
          </button>
          <div className="flex-1" />
          <div className="bg-surface-100 flex flex-col rounded-lg border px-3 py-1 leading-[1.25]">
            <span className="text-[11px] font-semibold whitespace-nowrap">{job.tech}</span>
            <span className="text-muted-foreground text-[10px] whitespace-nowrap">Checked in · {job.updatedAt}</span>
          </div>
        </div>

        {/* Body */}
        <div className="bg-surface-50 flex flex-1 flex-col gap-4 overflow-y-auto p-[18px]">
          <div className="flex flex-col">
            <EquipmentTabs job={job} activeTab={activeTabIdx} onSelect={setActiveTab} />
            <LineItemsCard job={job} activeTab={activeTabIdx} />
          </div>
          <UpdatesPanel job={job} />
          <WaiversPanel job={job} />
        </div>

        <PaymentBar job={job} />

        <HoldPromptModal job={job} />
        <ResolvePendingModal job={job} />
        <ReadyPromptModal />
        <PayModals job={job} />
      </SheetContent>
    </Sheet>
  );
}
