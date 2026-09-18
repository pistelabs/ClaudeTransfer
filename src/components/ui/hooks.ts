import { useEffect, useRef } from 'react';

/**
 * Calls `onOutside` when a mousedown lands outside the returned ref.
 * Runs on the capture phase so it fires before the click that opened a sibling menu.
 *
 * A Radix layer opened from inside the ref — a select in a hand-rolled popover,
 * say — is portalled to the end of the document, so by the DOM it is outside
 * something it plainly belongs to. Clicks in one are treated as inside.
 */
export function useOutsideClick<T extends HTMLElement>(active: boolean, onOutside: () => void) {
  const ref = useRef<T>(null);
  const handler = useRef(onOutside);
  handler.current = onOutside;

  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      const el = ref.current;
      const t = e.target as Element | null;
      if (t?.closest?.('[data-radix-popper-content-wrapper]')) return;
      if (el && !el.contains(e.target as Node)) handler.current();
    };
    window.addEventListener('mousedown', onDown, true);
    return () => window.removeEventListener('mousedown', onDown, true);
  }, [active]);

  return ref;
}

/**
 * Marks an Escape keypress as already spent on a Radix layer. Set by the
 * DropdownMenu and Popover content wrappers, read below.
 */
const HANDLED = Symbol.for('bootfit.escapeHandled');

export function markEscapeHandled(e: KeyboardEvent) {
  (e as KeyboardEvent & { [HANDLED]?: boolean })[HANDLED] = true;
}

/**
 * Escape closes the topmost layer.
 *
 * A Radix menu or popover over a sheet dismisses itself on the same keypress and
 * flushes that state change synchronously, which re-enables the sheet's own
 * handler while the event is still travelling. So the event itself carries
 * whether a layer already consumed it, rather than the sheet trying to work it
 * out from state that has moved on.
 */
export function useEscape(active: boolean, onEscape: () => void) {
  const handler = useRef(onEscape);
  handler.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if ((e as KeyboardEvent & { [HANDLED]?: boolean })[HANDLED]) return;
      handler.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);
}
