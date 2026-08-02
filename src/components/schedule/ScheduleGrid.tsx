import { useEffect, useLayoutEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import { SHOP_HOURS, STAFF } from '../../data/catalogue';
import { conflictIds, layout } from '../../lib/schedule';
import {
  GRID,
  GRID_END_MIN,
  GRID_START_MIN,
  durToPx,
  hourLabels,
  minsAtOffset,
  minsToPx,
  minutesSinceMidnight,
  rangeLabel,
} from '../../lib/time';
import { DAY_INFO, TODAY_IDX, useScheduler } from '../../store/useScheduler';
import type { Appointment, LaidOutAppt } from '../../types';
import { Avatar } from '../ui/Avatar';
import { AppointmentBlock } from './AppointmentBlock';

/** Below this width the shift-hours label is dropped so name and role keep priority. */
const SHIFT_LABEL_MIN_WIDTH = 190;
const DEFAULT_WIDTH = { day: 220, week: 150 } as const;
const MIN_WIDTH = 120;
const MAX_WIDTH = 520;
/** Pointer movement under this many px is treated as a click, not a drag. */
const JITTER = 4;

interface Column {
  idx: number;
  isStaff: boolean;
  title: string;
  sub: string;
  fullSub: string;
  shiftLabel: string;
  initials: string;
  dot: string;
  today: boolean;
  past: boolean;
  shift: [number, number];
  brk: [number, number] | null;
  appts: LaidOutAppt[];
}

function bandStyle(from: number, to: number): CSSProperties {
  return { top: minsToPx(from), height: durToPx(to - from) };
}

export function ScheduleGrid() {
  const view = useScheduler((s) => s.view);
  const selDay = useScheduler((s) => s.selDay);
  const appts = useScheduler((s) => s.appts);
  const staffFilter = useScheduler((s) => s.staffFilter);
  const colW = useScheduler((s) => s.colW);
  const drag = useScheduler((s) => s.drag);
  const sel = useScheduler((s) => s.sel);
  const setColWidth = useScheduler((s) => s.setColWidth);
  const setDrag = useScheduler((s) => s.setDrag);
  const commitDrag = useScheduler((s) => s.commitDrag);
  const setSelection = useScheduler((s) => s.setSelection);
  const startBooking = useScheduler((s) => s.startBooking);
  const openDetail = useScheduler((s) => s.openDetail);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ key: string; x: number; w: number } | null>(null);
  const selRectRef = useRef<DOMRect | null>(null);
  /** Suppresses the click that a finished drag would otherwise fire. */
  const draggedRef = useRef<string | null>(null);

  const isWeek = view === 'week';
  const colKey = (idx: number) => `${view}:${idx}`;
  const widthOf = (idx: number) => colW[colKey(idx)] ?? DEFAULT_WIDTH[view];

  // Appointments with the in-flight drag position applied, so the block and any
  // conflict styling track the pointer live.
  const effAppts: Appointment[] =
    drag && drag.moved
      ? appts.map((a) => (a.id === drag.id ? { ...a, d: drag.d, s: drag.s, st: drag.st } : a))
      : appts;

  const clash = conflictIds(effAppts);
  const showAllStaff = staffFilter.length === 0;
  const visibleStaff = showAllStaff ? STAFF.map((_, i) => i) : [...staffFilter].sort((a, b) => a - b);
  const weekAppts = showAllStaff ? effAppts : effAppts.filter((a) => staffFilter.includes(a.s));

  const columns: Column[] = isWeek
    ? DAY_INFO.map((d, di) => ({
        idx: di,
        isStaff: false,
        title: d.short,
        sub: d.date,
        fullSub: `${d.long}, ${d.date}`,
        shiftLabel: '',
        initials: '',
        dot: '#000',
        today: di === TODAY_IDX,
        past: d.past,
        shift: SHOP_HOURS,
        brk: null,
        appts: layout(weekAppts.filter((a) => a.d === di)),
      }))
    : visibleStaff.map((si) => {
        const s = STAFF[si];
        return {
          idx: si,
          isStaff: true,
          title: s.name,
          sub: s.role,
          fullSub: `${s.name} · ${s.role}`,
          shiftLabel: `${fmtShort(s.shift[0])}–${fmtShort(s.shift[1], true)}`,
          initials: s.initials,
          dot: s.dot,
          today: false,
          past: false,
          shift: s.shift,
          brk: s.brk,
          appts: layout(effAppts.filter((a) => a.d === selDay && a.s === si)),
        };
      });

  // Columns keep their width as a flex basis and share any spare space, so a wide
  // window fills edge to edge while a narrow one scrolls horizontally instead.
  const gridMinWidth = GRID.GUTTER + columns.reduce((sum, c) => sum + widthOf(c.idx), 0);

  // ---- interactions ------------------------------------------------------

  const startResize = (e: MouseEvent<HTMLDivElement>, idx: number) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    // Measure the rendered width: columns grow past their basis to fill spare space,
    // so the stored width alone would make the first drag jump.
    const rendered = e.currentTarget.parentElement?.offsetWidth ?? widthOf(idx);
    resizeRef.current = { key: colKey(idx), x: e.clientX, w: rendered };
  };

  const startDrag = (e: MouseEvent<HTMLDivElement>, a: LaidOutAppt) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDrag({ id: a.id, grabDy: e.clientY - rect.top, d: a.d, s: a.s, st: a.st, du: a.du, moved: false, x0: e.clientX, y0: e.clientY });
  };

  /** Pressing empty grid space begins a custom time window. */
  const startSelection = (e: MouseEvent<HTMLDivElement>, colIdx: number) => {
    if (e.button !== 0 || drag) return;
    if (e.target !== e.currentTarget) return; // ignore presses that land on a block
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    selRectRef.current = rect;
    const m = minsAtOffset(e.clientY, rect.top);
    setSelection({ col: colIdx, anchor: m, from: m, to: m + GRID.SNAP });
  };

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const rz = resizeRef.current;
      if (rz) {
        setColWidth(rz.key, Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, rz.w + (e.clientX - rz.x))));
      }

      const d = useScheduler.getState().drag;
      if (d) {
        // ignore pointer jitter so a plain click still opens the appointment
        if (!d.moved && Math.abs(e.clientX - d.x0) < JITTER && Math.abs(e.clientY - d.y0) < JITTER) return;
        const cols = Array.from(document.querySelectorAll<HTMLElement>('[data-schedcol]')).map((el) => ({
          idx: Number(el.dataset.schedcol),
          rect: el.getBoundingClientRect(),
        }));
        if (cols.length) {
          // nearest column under, or clamped to, the pointer
          const hit =
            cols.find((c) => e.clientX >= c.rect.left && e.clientX <= c.rect.right) ??
            cols.reduce((best, c) => {
              const dist = e.clientX < c.rect.left ? c.rect.left - e.clientX : e.clientX - c.rect.right;
              return !best || dist < best.dist ? { ...c, dist } : best;
            }, null as (typeof cols)[number] & { dist: number } | null)!;

          const y = e.clientY - d.grabDy - hit.rect.top;
          let mins = GRID_START_MIN + (y / GRID.HOUR_PX) * 60;
          mins = Math.round(mins / GRID.SNAP) * GRID.SNAP;
          mins = Math.max(GRID_START_MIN, Math.min(mins, GRID_END_MIN - d.du));
          const nextD = isWeek ? hit.idx : d.d;
          const nextS = isWeek ? d.s : hit.idx;
          if (mins !== d.st || nextD !== d.d || nextS !== d.s || !d.moved) {
            setDrag({ ...d, st: mins, d: nextD, s: nextS, moved: true });
          }
        }
      }

      const s = useScheduler.getState().sel;
      const rect = selRectRef.current;
      if (s && rect) {
        const m = minsAtOffset(e.clientY, rect.top);
        const from = Math.min(s.anchor, m);
        const to = Math.max(s.anchor + GRID.SNAP, m);
        if (from !== s.from || to !== s.to) setSelection({ ...s, from, to, moved: true });
      }
    };

    const onUp = () => {
      resizeRef.current = null;

      const d = useScheduler.getState().drag;
      if (d) {
        if (d.moved) {
          draggedRef.current = d.id;
          setTimeout(() => {
            draggedRef.current = null;
          }, 0);
        }
        commitDrag();
      }

      const s = useScheduler.getState().sel;
      if (s) {
        selRectRef.current = null;
        setSelection(null);
        startBooking(s.col, s.from, s.moved ? s.to - s.from : null);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isWeek, setColWidth, setDrag, setSelection, commitDrag, startBooking]);

  // Open the view just before the earliest shift rather than at 6 AM.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const earliest = Math.min(...STAFF.map((s) => s.shift[0]));
    el.scrollTop = Math.max(0, minsToPx(earliest - 45));
  }, []);

  const nowMin = minutesSinceMidnight();
  const showNow = !isWeek && selDay === TODAY_IDX && nowMin >= GRID_START_MIN && nowMin <= GRID_END_MIN;

  return (
    <div className="grid" ref={scrollerRef}>
      <div className="grid__inner" style={{ minWidth: gridMinWidth }}>
        <div className="grid__head">
          <div className="grid__head-gutter" />
          {columns.map((col) => {
            const width = widthOf(col.idx);
            return (
              <div
                className={`col-head${col.today ? ' col-head--today' : ''}${col.past ? ' col-head--past' : ''}`}
                key={col.idx}
                style={{ flex: `1 0 ${width}px` }}
              >
                {col.isStaff && <Avatar initials={col.initials} color={col.dot} size={24} fontSize={10} />}
                <div style={{ flex: 1, minWidth: 0 }} title={col.fullSub}>
                  <div
                    className={`col-head__title${col.today ? ' col-head__title--today' : ''}${col.past ? ' col-head__title--past' : ''}`}
                  >
                    {col.title}
                  </div>
                  <div className="col-head__sub">{col.sub}</div>
                </div>
                {col.isStaff && width >= SHIFT_LABEL_MIN_WIDTH && (
                  <span className="col-head__shift">{col.shiftLabel}</span>
                )}
                <div
                  className="col-head__resize"
                  title="Drag to resize column"
                  onMouseDown={(e) => startResize(e, col.idx)}
                />
              </div>
            );
          })}
        </div>

        <div className="grid__body">
          <div className="gutter">
            {hourLabels().map((label) => (
              <div className="gutter__hour" key={label}>
                <span className="gutter__label">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid__cols">
            {columns.map((col) => {
              const width = widthOf(col.idx);
              const selected = sel?.col === col.idx ? sel : null;
              return (
                <div
                  className="sched-col"
                  key={col.idx}
                  data-schedcol={col.idx}
                  title="Click or drag an empty slot to book"
                  style={{ flex: `1 0 ${width}px`, height: durToPx(GRID.HOURS * 60) }}
                  onMouseDown={(e) => startSelection(e, col.idx)}
                >
                  <div className="band band--shift" style={bandStyle(col.shift[0], col.shift[1])} />
                  {col.brk && <div className="band band--break" style={bandStyle(col.brk[0], col.brk[1])} />}

                  {selected && (
                    <div className="selection" style={bandStyle(selected.from, selected.to)}>
                      {rangeLabel(selected.from, selected.to)}
                    </div>
                  )}

                  {col.appts.map((a) => (
                    <AppointmentBlock
                      key={a.id}
                      appt={a}
                      conflict={clash.has(a.id)}
                      dragging={drag?.id === a.id}
                      onMouseDown={(e) => startDrag(e, a)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (draggedRef.current === a.id) return;
                        openDetail(a.id);
                      }}
                    />
                  ))}
                </div>
              );
            })}

            {showNow && (
              <div className="now-line" style={{ top: minsToPx(nowMin) }}>
                <span className="now-line__dot" />
                <div className="now-line__rule" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact shift label: `8:30–5:30 PM`. */
function fmtShort(m: number, withMeridiem = false): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  let hh = h % 12;
  if (hh === 0) hh = 12;
  const base = `${hh}:${mm < 10 ? '0' : ''}${mm}`;
  return withMeridiem ? `${base} ${h < 12 ? 'AM' : 'PM'}` : base;
}
