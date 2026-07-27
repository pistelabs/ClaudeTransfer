import { useEffect, useRef } from "react";

/** Barcode scanners act as keyboard wedges: they emit a whole code as keystrokes far faster
 * than anyone can type, usually terminated by Enter. Anything slower than this between
 * characters is treated as a human at the keyboard and ignored. */
const SCAN_CHAR_GAP_MS = 35;
/** Scanners that don't send a terminator are committed once the burst goes quiet. */
const SCAN_IDLE_COMMIT_MS = 90;
/** Short bursts are more likely to be stray keypresses than a real code. */
const SCAN_MIN_LENGTH = 4;

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/**
 * Listens document-wide for barcode scans so a code lands wherever it's needed without the
 * user having to click into a field first. Typing is left alone — both because a human never
 * sustains scanner speed, and because bursts are ignored entirely while a field has focus.
 */
export function useBarcodeScanner(onScan: (code: string) => void) {
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let buffer = "";
    let lastKeyAt = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const reset = () => {
      buffer = "";
      if (idleTimer) clearTimeout(idleTimer);
    };

    const commit = () => {
      const code = buffer.trim();
      reset();
      if (code.length >= SCAN_MIN_LENGTH) onScanRef.current(code);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Someone is typing into a field (including the search box itself) — leave them to it.
      if (isEditable(e.target)) return reset();
      if (e.ctrlKey || e.metaKey || e.altKey) return reset();

      if (e.key === "Enter") {
        if (buffer.length >= SCAN_MIN_LENGTH) {
          e.preventDefault();
          commit();
        } else {
          reset();
        }
        return;
      }

      if (e.key.length !== 1) return;

      const now = performance.now();
      // A gap this long means the burst is over (or never started), so this key begins a new one.
      if (now - lastKeyAt > SCAN_CHAR_GAP_MS) buffer = "";
      lastKeyAt = now;
      buffer += e.key;

      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(commit, SCAN_IDLE_COMMIT_MS);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);
}
