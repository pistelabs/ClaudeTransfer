import { useEffect, useRef, useState } from "react";
import { Filter, Landmark, Plus, Search } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { EQUIPMENT_CATEGORIES } from "../types";
import { CheckedBox } from "./Pills";
import { useBarcodeScanner } from "../lib/useBarcodeScanner";

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
    <header className="z-10 flex h-[60px] flex-shrink-0 items-center gap-4 border-b border-border bg-white px-5">
      <span className="text-sm font-semibold tracking-tight">Workshop Jobs</span>
      <div className="flex items-center gap-1.5 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-[11px] py-1">
        <Landmark size={12} color="#0284c7" strokeWidth={2} />
        <span className="whitespace-nowrap text-[12.5px] font-semibold text-sky-hover">City Skis</span>
      </div>

      <div className="relative ml-2 w-[280px]">
        <Search size={15} strokeWidth={2} color="#71717a" className="pointer-events-none absolute left-[10px] top-1/2 -translate-y-1/2" />
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search job #, customer, equipment or scan a barcode..."
          className="h-9 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-[13px] text-ink outline-none focus:border-zinc-400 focus:shadow-[0_0_0_3px_rgba(161,161,170,0.15)]"
        />
      </div>

      <div className="flex-1" />

      <div className="relative">
        {filterOpen && <div className="fixed inset-0 z-20" onClick={closeFilter} />}
        <button
          onClick={toggleFilterOpen}
          className="relative z-[21] flex h-9 items-center gap-[7px] rounded-lg border px-[13px] text-[13px] font-medium hover:bg-app-bg"
          style={{
            color: filterActive ? "#0369a1" : "#09090b",
            background: filterActive ? "#eff6ff" : "#ffffff",
            borderColor: filterActive ? "#bfdbfe" : "#e4e4e7",
          }}
        >
          <Filter size={14} />
          Filter
          {filterActive && (
            <span className="flex min-w-[17px] items-center justify-center rounded-full bg-sky px-1 text-[10px] font-bold leading-[17px] text-white">
              {filterCats.length}
            </span>
          )}
        </button>
        {filterOpen && (
          <div className="absolute right-0 top-[42px] z-[22] w-[210px] rounded-[10px] border border-border bg-white p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
            <div className="flex items-center justify-between px-2 pb-2 pt-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">Equipment type</span>
              {filterActive && (
                <button onClick={clearFilter} className="text-[11px] font-semibold text-sky-hover">
                  Clear
                </button>
              )}
            </div>
            {EQUIPMENT_CATEGORIES.map((cat) => {
              const on = filterCats.includes(cat);
              return (
                <div
                  key={cat}
                  onClick={() => toggleFilterCat(cat)}
                  className="flex cursor-pointer items-center gap-[9px] rounded-[7px] px-2 py-[7px] hover:bg-app-bg"
                >
                  <CheckedBox on={on} />
                  <span className="text-[12.5px] font-medium text-zinc-900">{cat}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={openNew}
        className="flex h-9 items-center gap-[7px] rounded-lg bg-sky px-[15px] text-[13px] font-semibold text-white hover:bg-sky-hover"
      >
        <Plus size={15} strokeWidth={2.2} />
        New
      </button>
    </header>
  );
}
