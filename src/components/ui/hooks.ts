import { useEffect, useRef } from 'react';

/**
 * Calls `onOutside` when a mousedown lands outside the returned ref.
 * Runs on the capture phase so it fires before the click that opened a sibling menu.
 */
export function useOutsideClick<T extends HTMLElement>(active: boolean, onOutside: () => void) {
  const ref = useRef<T>(null);
  const handler = useRef(onOutside);
  handler.current = onOutside;

  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      const el = ref.current;
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
