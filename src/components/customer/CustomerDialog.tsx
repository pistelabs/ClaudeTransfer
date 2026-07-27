import { Mail, MessageSquare, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export function CustomerDialog() {
  const addCustOpen = useAppStore((s) => s.addCustOpen);
  const editCustId = useAppStore((s) => s.editCustId);
  const ncust = useAppStore((s) => s.ncust);
  const patchNcust = useAppStore((s) => s.patchNcust);
  const closeAddCust = useAppStore((s) => s.closeAddCust);
  const addCustomer = useAppStore((s) => s.addCustomer);

  if (!addCustOpen) return null;

  const canSave = ncust.first.trim().length > 0 && ncust.last.trim().length > 0;
  const title = editCustId ? "Edit customer" : "Add a customer";
  const sub = editCustId ? "Update the customer's information below." : "Enter the customer's information below.";
  const btnLabel = editCustId ? "Save changes" : "Add customer";

  return (
    <div
      onClick={closeAddCust}
      className="animate-sheet-fade fixed inset-0 z-[60] flex items-center justify-center p-6"
      style={{ background: "rgba(9,9,11,0.45)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-pop flex w-full max-w-[460px] flex-col gap-4 rounded-[14px] border border-border bg-white p-[22px]"
        style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[19px] font-extrabold tracking-tight">{title}</span>
            <span className="text-[13px] text-zinc-500">{sub}</span>
          </div>
          <button onClick={closeAddCust} className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-app-bg hover:text-ink">
            <X size={17} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-zinc-900">First name</span>
            <input
              value={ncust.first}
              onChange={(e) => patchNcust({ first: e.target.value })}
              placeholder="Jane"
              className="h-11 w-full rounded-[10px] border border-border px-[13px] text-sm outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-zinc-900">Last name</span>
            <input
              value={ncust.last}
              onChange={(e) => patchNcust({ last: e.target.value })}
              placeholder="Doe"
              className="h-11 w-full rounded-[10px] border border-border px-[13px] text-sm outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-zinc-900">Email address</span>
            <input
              value={ncust.email}
              onChange={(e) => patchNcust({ email: e.target.value })}
              placeholder="jane@example.com"
              className="h-11 w-full rounded-[10px] border border-border px-[13px] text-sm outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-zinc-900">Phone number</span>
            <input
              value={ncust.phone}
              onChange={(e) => patchNcust({ phone: e.target.value })}
              placeholder="(604) 555-0100"
              className="h-11 w-full rounded-[10px] border border-border px-[13px] text-sm outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
            />
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[12.5px] font-semibold text-zinc-900">Preferred contact channel</span>
          <div className="flex gap-3.5">
            <button
              onClick={() => patchNcust({ channel: "Email" })}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] border text-sm font-semibold"
              style={{
                color: ncust.channel === "Email" ? "#ffffff" : "#18181b",
                background: ncust.channel === "Email" ? "#18181b" : "#ffffff",
                borderColor: ncust.channel === "Email" ? "#18181b" : "#e4e4e7",
              }}
            >
              <Mail size={16} />
              Email
            </button>
            <button
              onClick={() => patchNcust({ channel: "SMS" })}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] border text-sm font-semibold"
              style={{
                color: ncust.channel === "SMS" ? "#ffffff" : "#18181b",
                background: ncust.channel === "SMS" ? "#18181b" : "#ffffff",
                borderColor: ncust.channel === "SMS" ? "#18181b" : "#e4e4e7",
              }}
            >
              <MessageSquare size={16} />
              SMS
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2.5 pt-1">
          <button onClick={closeAddCust} className="h-[42px] rounded-[9px] border border-border bg-white px-5 text-[13.5px] font-medium text-zinc-900 hover:bg-app-bg">
            Cancel
          </button>
          <button
            onClick={addCustomer}
            disabled={!canSave}
            className="h-[42px] rounded-[9px] px-5 text-[13.5px] font-semibold"
            style={{
              color: canSave ? "#ffffff" : "#c4c4c8",
              background: canSave ? "#18181b" : "#f4f4f5",
              border: canSave ? "none" : "1px solid #e4e4e7",
              cursor: canSave ? "pointer" : "not-allowed",
            }}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
