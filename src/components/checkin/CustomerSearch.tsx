import { Plus, Search, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Avatar } from "../Pills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
          (c) =>
            (c.first + " " + c.last).toLowerCase().includes(q) ||
            (c.email || "").toLowerCase().includes(q) ||
            (c.phone || "").includes(q),
        )
      : [];

  if (selected) {
    return (
      <div className="flex items-center gap-[11px] rounded-lg border bg-white px-3 py-2.5">
        <button
          onClick={() => editSelCustomer(nf.customer, nf.email, nf.phone)}
          title="Edit customer details"
          className="focus-visible:ring-ring/50 flex min-w-0 flex-1 items-center gap-[11px] rounded-lg text-left outline-none hover:opacity-70 focus-visible:ring-[3px]"
        >
          <Avatar name={nf.customer || "?"} />
          <div className="flex min-w-0 flex-1 flex-col leading-[1.3]">
            <span className="text-[13.5px] font-semibold whitespace-nowrap">{nf.customer}</span>
            <span className="text-muted-foreground overflow-hidden text-[11.5px] text-ellipsis whitespace-nowrap">
              {nf.email} {nf.email && nf.phone ? "· " : ""}
              {nf.phone}
            </span>
          </div>
        </button>
        <Button variant="outline" size="icon" onClick={clearCustomer} className="size-7 shrink-0">
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={custQuery}
          onChange={(e) => setCustQuery(e.target.value)}
          placeholder="Search existing customer (min 3 characters)..."
          className="h-[42px] bg-white pl-9"
        />
      </div>
      {q.length >= 3 && (
        <div className="flex flex-col gap-1.5 rounded-lg border bg-white p-[5px]">
          {results.map((c) => (
            <div
              key={c.id}
              onClick={() => selectCustomer(c)}
              className="hover:bg-accent flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2"
            >
              <Avatar name={c.first + " " + c.last} size={30} />
              <div className="flex min-w-0 flex-1 flex-col leading-[1.3]">
                <span className="text-[13px] font-semibold whitespace-nowrap">
                  {c.first} {c.last}
                </span>
                <span className="text-muted-foreground overflow-hidden text-[11px] text-ellipsis whitespace-nowrap">
                  {c.email} · {c.phone}
                </span>
              </div>
              <Badge variant="secondary" className="rounded-full whitespace-nowrap">
                {c.equipment.length} {c.equipment.length === 1 ? "item" : "items"}
              </Badge>
            </div>
          ))}
          <Button
            variant="ghost"
            onClick={() => openAddCust()}
            className="border-app-bg justify-start rounded-t-none border-t font-semibold"
          >
            <Plus strokeWidth={2.2} />
            Add new customer
          </Button>
        </div>
      )}
    </div>
  );
}
