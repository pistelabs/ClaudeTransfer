import { Plus, Search, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Avatar } from "../Pills";

export function CustomerSearch() {
  const nf = useAppStore((s) => s.nf);
  const custQuery = useAppStore((s) => s.custQuery);
  const setCustQuery = useAppStore((s) => s.setCustQuery);
  const customers = useAppStore((s) => s.customers);
  const selectCustomer = useAppStore((s) => s.selectCustomer);
  const clearCustomer = useAppStore((s) => s.clearCustomer);
  const openAddCust = useAppStore((s) => s.openAddCust);
  const editSelCustomer = useAppStore((s) => s.editCustomerByName);

  const selected = !!nf.customerId || !!(nf.customer && nf.customer.trim());
  const q = custQuery.trim().toLowerCase();
  const results =
    q.length >= 3
      ? customers.filter(
          (c) => (c.first + " " + c.last).toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q) || (c.phone || "").includes(q),
        )
      : [];

  if (selected) {
    return (
      <div className="flex items-center gap-[11px] rounded-[10px] border border-border bg-white p-[10px_12px]">
        <div
          onClick={() => editSelCustomer(nf.customer, nf.email, nf.phone)}
          title="Edit customer details"
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-[11px] rounded-lg hover:opacity-70"
        >
          <Avatar name={nf.customer || "?"} />
          <div className="flex min-w-0 flex-1 flex-col leading-[1.3]">
            <span className="whitespace-nowrap text-[13.5px] font-semibold text-zinc-900">{nf.customer}</span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] text-zinc-500">
              {nf.email} {nf.email && nf.phone ? "· " : ""}
              {nf.phone}
            </span>
          </div>
        </div>
        <button
          onClick={clearCustomer}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border text-zinc-500 hover:bg-app-bg hover:text-ink"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search size={15} strokeWidth={2} color="#71717a" className="pointer-events-none absolute left-[11px] top-1/2 -translate-y-1/2" />
        <input
          value={custQuery}
          onChange={(e) => setCustQuery(e.target.value)}
          placeholder="Search existing customer (min 3 characters)..."
          className="h-[42px] w-full rounded-[9px] border border-border bg-white pl-[34px] pr-3 text-[13.5px] outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
        />
      </div>
      {q.length >= 3 && (
        <div className="flex flex-col gap-1.5 rounded-[10px] border border-border bg-white p-[5px]">
          {results.map((c) => (
            <div
              key={c.id}
              onClick={() => selectCustomer(c)}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg p-[8px_9px] hover:bg-app-bg"
            >
              <Avatar name={c.first + " " + c.last} size={30} />
              <div className="flex min-w-0 flex-1 flex-col leading-[1.3]">
                <span className="whitespace-nowrap text-[13px] font-semibold text-zinc-900">
                  {c.first} {c.last}
                </span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-zinc-500">
                  {c.email} · {c.phone}
                </span>
              </div>
              <span className="whitespace-nowrap rounded-full bg-app-bg px-2 py-0.5 text-[10.5px] font-semibold text-zinc-500">
                {c.equipment.length} {c.equipment.length === 1 ? "item" : "items"}
              </span>
            </div>
          ))}
          <button
            onClick={() => openAddCust()}
            className="flex w-full items-center gap-2 rounded-b-[7px] border-t border-app-bg p-[9px_10px] text-left text-[12.5px] font-semibold text-sky-hover hover:bg-[#eff6ff]"
          >
            <Plus size={15} strokeWidth={2.2} />
            Add new customer
          </button>
        </div>
      )}
    </div>
  );
}
