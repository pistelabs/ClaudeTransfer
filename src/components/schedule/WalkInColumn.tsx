import { useEffect, useRef, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, Plus, UserCheck } from 'lucide-react';
import { STAFF, TYPES } from '../../data/catalogue';
import { formatStamp, initialsOf } from '../../lib/dates';
import { checkInLabel, partyOf, slotOpen } from '../../lib/schedule';
import { GRID_END_MIN, durationLabel, minsAtOffset } from '../../lib/time';
import { useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';

/** Pointer movement under this many px is treated as a click, not a drag. */
const JITTER = 4;

/**
 * The walk-in queue: people who checked themselves in at the portal with no
 * appointment. They have no fitter, day or time yet, so they cannot live in the
 * grid — they wait here until somebody books them in.
 *
 * Collapses to a rail, because a shop that takes no walk-ins should not have to
 * give the column any width.
 */
export function WalkInColumn() {
  const walkIns = useScheduler((s) => s.walkIns);
  const open = useScheduler((s) => s.walkInsOpen);
  const toggle = useScheduler((s) => s.toggleWalkIns);
  const openDetail = useScheduler((s) => s.openDetail);
  const openQueueAdd = useScheduler((s) => s.openQueueAdd);
  const dragId = useScheduler((s) => s.walkInDrag?.id ?? null);
  const startWalkInDrag = useScheduler((s) => s.startWalkInDrag);
  const setWalkInDrag = useScheduler((s) => s.setWalkInDrag);
  const dropWalkIn = useScheduler((s) => s.dropWalkIn);

  /** Suppresses the click that a finished drag would otherwise fire. */
  const draggedRef = useRef<string | null>(null);

  /**
   * The queue sits outside the grid, so a card dragged out of it is tracked
   * against the schedule columns in the document rather than against any
   * container of its own. Listeners only exist while a drag is in flight.
   */
  useEffect(() => {
    if (!dragId) return;

    const onMove = (e: globalThis.MouseEvent) => {
      const d = useScheduler.getState().walkInDrag;
      if (!d) return;
      // ignore pointer jitter so a plain click still opens the walk-in
      if (!d.moved && Math.abs(e.clientX - d.x0) < JITTER && Math.abs(e.clientY - d.y0) < JITTER) return;

      const { view, selDay, appts } = useScheduler.getState();
      const isWeek = view === 'week';
      const hit = Array.from(document.querySelectorAll<HTMLElement>('[data-schedcol]'))
        .map((el) => ({ idx: Number(el.dataset.schedcol), rect: el.getBoundingClientRect() }))
        .find(
          (c) =>
            e.clientX >= c.rect.left &&
            e.clientX <= c.rect.right &&
            e.clientY >= c.rect.top &&
            e.clientY <= c.rect.bottom,
        );

      let over: typeof d.over = null;
      if (hit) {
        const st = Math.min(minsAtOffset(e.clientY, hit.rect.top), GRID_END_MIN - d.du);
        const day = isWeek ? hit.idx : selDay;
        // A week column is a day, so it carries no fitter of its own: take the
        // first one actually free at that time, falling back to the first fitter
        // when nobody is.
        const free = STAFF.findIndex((_, i) => slotOpen(appts, i, day, st, d.du));
        over = { d: day, s: isWeek ? Math.max(free, 0) : hit.idx, st };
      }

      if (!d.moved || over?.d !== d.over?.d || over?.s !== d.over?.s || over?.st !== d.over?.st) {
        setWalkInDrag({ ...d, moved: true, over });
      }
    };

    const onUp = () => {
      const d = useScheduler.getState().walkInDrag;
      if (d?.moved) {
        draggedRef.current = d.id;
        setTimeout(() => {
          draggedRef.current = null;
        }, 0);
      }
      dropWalkIn();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragId, setWalkInDrag, dropWalkIn]);

  const startDrag = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    if (e.button !== 0) return;
    e.preventDefault(); // also stops the press selecting the card's text
    startWalkInDrag(id, e.clientX, e.clientY);
  };

  if (!open) {
    return (
      <aside className="walkins walkins--collapsed">
        <button className="walkins__rail" type="button" title="Show checked in" onClick={toggle}>
          <ChevronRight size={15} strokeWidth={2.2} />
          <span className="walkins__rail-count">{walkIns.length}</span>
          <span className="walkins__rail-label">Checked in</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="walkins" aria-label="Checked in">
      <div className="walkins__head">
        <UserCheck size={15} strokeWidth={2.2} color="var(--n-400)" />
        <span className="walkins__title">Checked in</span>
        <span className="walkins__count">{walkIns.length}</span>
        <button
          className="walkins__btn"
          type="button"
          title="Check somebody in"
          aria-label="Check somebody in"
          onClick={openQueueAdd}
        >
          <Plus size={16} strokeWidth={2.2} />
        </button>
        <button className="walkins__btn" type="button" title="Hide checked in" onClick={toggle}>
          <ChevronLeft size={15} strokeWidth={2.2} />
        </button>
      </div>

      <div className="walkins__list">
        {walkIns.length === 0 ? (
          <div className="walkins__empty">
            <div className="empty-state__title">Nobody waiting</div>
            <div className="empty-state__body">
              People who check in at the portal appear here. Staff can add one with the + above.
            </div>
          </div>
        ) : (
          walkIns.map((w) => {
            const type = TYPES[w.t];
            const names = partyOf(w);
            return (
              <button
                className={`walkin${dragId === w.id ? ' walkin--dragging' : ''}`}
                type="button"
                key={w.id}
                title="Click to open, or drag onto a column to book in"
                style={{ borderLeftColor: type.border }}
                onMouseDown={(e) => startDrag(e, w.id)}
                onClick={() => {
                  if (draggedRef.current === w.id) return;
                  openDetail(w.id);
                }}
              >
                <div className="walkin__head">
                  <Avatar initials={initialsOf(names[0])} color={type.border} size={26} fontSize={10} />
                  <span className="walkin__name">{names.join(', ')}</span>
                </div>
                <span className="walkin__service" style={{ color: type.text, background: type.bg }}>
                  {type.label}
                </span>
                {/* Who checked them in and exactly when — the date included, because
                    a queue entry can outlive the day it was made. The source gets a
                    line of its own: a fitter's full name does not share one well. */}
                <span className="walkin__source">{checkInLabel(w.checkedInBy)}</span>
                <div className="walkin__meta">
                  <span className="walkin__stamp">{formatStamp(w.checkedInAt)}</span>
                  <span className="walkin__dur">{durationLabel(w.du)}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
