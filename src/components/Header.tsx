import { useEffect, useRef, useState } from "react";
import { Filter, Landmark, Plus, Search } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { EQUIPMENT_CATEGORIES } from "../types";
import { useBarcodeScanner } from "../lib/useBarcodeScanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function Header() {
  const query = useAppStore((s) => s.query);
  const setQuery = useAppStore((s) => s.setQuery);
  const filterOpen = useAppStore((s) => s.filterOpen);
  const toggleFilterOpen = useAppStore((s) => s.toggleFilterOpen);
  const closeFilter = useAppStore((s) => s.closeFilter);
  const filterCats = useAppStore((s) => s.filterCats);
  const toggleFilterCat = useAppStore((s) => s.toggleFilterCat);
  const clearFilter = useAppStore((s) => s.clearFilter);
  const openNew = useAppStore((s) => s.openNew);
  const searchRef = useRef<HTMLInputElement>(null);

  // A scanned barcode drops straight into the job search — no need to click the field first.
  const [scanNonce, setScanNonce] = useState(0);
  useBarcodeScanner((code) => {
    setQuery(code);
    setScanNonce((n) => n + 1);
  });

  // Focus and select *after* React has written the new value, otherwise the commit collapses
  // the selection. Leaving it selected means a second scan replaces the first rather than
  // appending to it, since by then the field has focus and the scanner just types into it.
  useEffect(() => {
    if (!scanNonce) return;
    const el = searchRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [scanNonce]);

  const filterActive = filterCats.length > 0;

  return (
    <header className="z-10 flex h-[60px] shrink-0 items-center gap-4 border-b bg-white px-5">
      <span className="text-sm font-semibold tracking-tight">Workshop Jobs</span>
      <Badge variant="outline" className="gap-1.5 rounded-full border-sky-200 bg-sky-50 text-[12.5px] text-sky-700">
        <Landmark strokeWidth={2} />
        City Skis
      </Badge>

      <div className="relative ml-2 w-[280px]">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search job #, customer, equipment or scan a barcode..."
          className="bg-white pl-8"
        />
      </div>

      <div className="flex-1" />

      <DropdownMenu open={filterOpen} onOpenChange={(o) => (o ? toggleFilterOpen() : closeFilter())}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={filterActive ? "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100" : undefined}
          >
            <Filter />
            Filter
            {filterActive && (
              <Badge className="bg-sky size-[17px] rounded-full p-0 text-[10px] text-white tabular-nums">
                {filterCats.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[210px]">
          <DropdownMenuLabel className="flex items-center justify-between pb-2">
            <span className="text-muted-foreground text-[11px] font-bold tracking-wide uppercase">Equipment type</span>
            {filterActive && (
              <button onClick={clearFilter} className="text-sky-hover text-[11px] font-semibold">
                Clear
              </button>
            )}
          </DropdownMenuLabel>
          {EQUIPMENT_CATEGORIES.map((cat) => (
            <div
              key={cat}
              onClick={() => toggleFilterCat(cat)}
              className="hover:bg-accent flex cursor-pointer items-center gap-[9px] rounded-sm px-2 py-[7px]"
            >
              <Checkbox checked={filterCats.includes(cat)} />
              <span className="text-[12.5px] font-medium">{cat}</span>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={openNew}>
        <Plus strokeWidth={2.2} />
        New
      </Button>
    </header>
  );
}
