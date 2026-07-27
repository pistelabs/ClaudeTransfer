import { X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Avatar } from "../Pills";
import { EquipmentTabs } from "./EquipmentTabs";
import { LineItemsCard } from "./LineItemsCard";
import { UpdatesPanel } from "./UpdatesPanel";
import { PaymentBar } from "./PaymentBar";
import { HoldPromptModal, PayModals, ReadyPromptModal, ResolvePendingModal } from "./DetailModals";

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
    <div className="animate-sheet-fade fixed inset-0 z-40" style={{ background: "rgba(9,9,11,0.45)" }} onClick={closeDetail}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-slide absolute bottom-0 right-0 top-0 flex w-[680px] max-w-[94vw] flex-col overflow-hidden border-l border-border bg-white"
        style={{ boxShadow: "-12px 0 40px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2.5 border-b border-app-bg px-[18px] py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="whitespace-nowrap text-base font-bold tracking-tight">Job ID {job.id}</span>
            {isOverdue && (
              <span className="inline-flex w-fit items-center gap-[5px] whitespace-nowrap rounded-full border border-[#fecaca] bg-[#fef2f2] px-[9px] py-[3px] text-[10.5px] font-bold tracking-wide text-red">
                OVERDUE
              </span>
            )}
          </div>
          <div
            onClick={() => editCustomerByName(job.customer, job.email, job.phone)}
            title="Edit customer details"
            className="flex min-w-0 cursor-pointer items-center gap-[9px] rounded-full border border-border bg-surface-100 py-[5px] pl-[5px] pr-[13px] hover:bg-[#f0f0f1]"
          >
            <Avatar name={job.customer} size={34} />
            <div className="flex min-w-0 flex-col leading-[1.3]">
              <span className="whitespace-nowrap text-[12.5px] font-semibold text-zinc-900">{job.customer}</span>
              <span className="max-w-[210px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-zinc-500">
                {job.email} · {job.phone}
              </span>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex flex-col rounded-lg border border-border bg-surface-100 px-3 py-1 leading-[1.25]">
            <span className="whitespace-nowrap text-[11px] font-semibold text-zinc-900">{job.tech}</span>
            <span className="whitespace-nowrap text-[10px] text-zinc-500">Checked in · {job.updatedAt}</span>
          </div>
          <button
            onClick={closeDetail}
            className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-app-bg hover:text-ink"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-surface-50 p-[18px]">
          <div className="flex flex-col">
            <EquipmentTabs job={job} activeTab={activeTabIdx} onSelect={setActiveTab} />
            <LineItemsCard job={job} activeTab={activeTabIdx} />
          </div>
          <UpdatesPanel job={job} />
        </div>

        <PaymentBar job={job} />

        <HoldPromptModal job={job} />
        <ResolvePendingModal job={job} />
        <ReadyPromptModal />
        <PayModals job={job} />
      </div>
    </div>
  );
}
