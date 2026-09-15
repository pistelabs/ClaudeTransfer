import { svcPrice } from "./serviceCatalog";
import type { ServiceData } from "../types";

/** What a job costs before any adjustment, what it costs after, and the difference.
 * A positive `discount` means the price was adjusted downward. */
export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  total: number;
}

/** True when the breakdown is worth showing in full rather than as a single Total Due. */
export function hasAdjustment(p: PriceBreakdown): boolean {
  return Math.abs(p.subtotal - p.total) >= 0.005;
}

interface PricedItem {
  services: string[];
  serviceData: Record<string, ServiceData>;
  priceOverride?: number | string | null;
}

/** Catalogue price of one item — what its services come to before any manual override. */
export function itemSubtotal(it: PricedItem): number {
  return it.services.reduce((a, n) => a + svcPrice(n, it.serviceData), 0);
}

/** What the item is actually being charged at: the manual override when one is set. */
export function itemTotal(it: PricedItem): number {
  const base = itemSubtotal(it);
  return it.priceOverride != null && it.priceOverride !== "" ? Number(it.priceOverride) : base;
}

export function priceItems(items: PricedItem[]): PriceBreakdown {
  const subtotal = items.reduce((a, it) => a + itemSubtotal(it), 0);
  const total = items.reduce((a, it) => a + itemTotal(it), 0);
  return { subtotal, discount: subtotal - total, total };
}
