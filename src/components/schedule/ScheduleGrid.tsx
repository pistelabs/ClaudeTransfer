import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { SHOP_HOURS, STAFF } from '../../data/catalogue';
import { conflictIds, fittersOf, layout } from '../../lib/schedule';
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
import { weekAt } from '../../lib/dates';
import { TODAY_IDX, useScheduler } from '../../store/useScheduler';
import type { Appointment, LaidOutAppt } from '../../types';
import { Avatar } from '../ui/Avatar';
import { AppointmentBlock } from './AppointmentBlock';

/** Below this width the shift-hours label is dropped so name and role keep priority. */
const SHIFT_LABEL_MIN_WIDTH = 190;
const DEFAULT_WIDTH = { day: 220, week: 150 } as const;
/** A week split by fitter has seven times as many columns, so they start narrower. */
const SPLIT_WEEK_WIDTH = 112;
const MIN_WIDTH = 120;
const SPLIT_MIN_WIDTH = 84;
const MAX_WIDTH = 520;
/** Pointer movement under this many px is treated as a click, not a drag. */
const JITTER = 4;

/**
 * One column of the grid. A day-view column is a fitter; a week-view column is a
 * day, or — when the schedule is filtered to particular fitters — one fitter
 * within a day, so the week can be read per person.
 */
interface Leaf {
  /** identity for widths and selection; stable across renders */
  key: string;
  d: number;
  /** the fitter this column belongs to, or null when it pools every fitter */
  s: number | null;
  today: boolean;
  past: boolean;
  shift: [number, number];
  brk: [number, number] | null;
  appts: LaidOutAppt[];
}

/** A day in week view, and the fitter columns it is divided into. */
interface DayGroup {
  d: number;
  title: string;
  sub: string;
  fullSub: string;
  today: boolean;
  past: boolean;
  leaves: Leaf[];
}

function bandStyle(from: number, to: number): CSSProperties {
  return { top: minsToPx(from), height: durToPx(to - from) };
}

export function ScheduleGrid() {
  const view = useScheduler((s) => s.view);
  const selDay = useScheduler((s) => s.selDay);
  const weekOffset = useScheduler((s) => s.weekOffset);
  const appts = useScheduler((s) => s.appts);
  const staffFilter = useScheduler((s) => s.staffFilter);
  const colW = useScheduler((s) => s.colW);
  const drag = useScheduler((s) => s.drag);
  const walkInDrag = useScheduler((s) => s.walkInDrag);
  const sel = useScheduler((s) => s.sel);
  const setColWidth = useScheduler((s) => s.setColWidth);
  const setColWidths = useScheduler((s) => s.setColWidths);
  const setDrag = useScheduler((s) => s.setDrag);
  const commitDrag = useScheduler((s) => s.commitDrag);
  const setSelection = useScheduler((s) => s.setSelection);
  const startBooking = useScheduler((s) => s.startBooking);
  const openDetail = useScheduler((s) => s.openDetail);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ key: string; x: number; w: number; min: number } | null>(null);
  const selRectRef = useRef<DOMRect | null>(null);
  /** Suppresses the click that a finished drag would otherwise fire. */
  const draggedRef = useRef<string | null>(null);

  const isWeek = view === 'week';

  // Track the visible width so untouched columns can share it evenly.
  const [viewportW, setViewportW] = useState(0);
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => setViewportW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Appointments with the in-flight drag position applied, so the block and any
  // conflict styling track the pointer live.
  const effAppts: Appointment[] =
    drag && drag.moved
      ? appts.map((a) => (a.id === drag.id ? { ...a, d: drag.d, s: drag.s, st: drag.st } : a))
      : appts;

  const clash = conflictIds(effAppts);
  const showAllStaff = staffFilter.length === 0;
  const visibleStaff = showAllStaff ? STAFF.map((_, i) => i) : [...staffFilter].sort((a, b) => a - b);
  /**
   * A filtered week divides each day into a column per chosen fitter. Unfiltered
   * it would be twenty-eight columns of nothing much, so the whole team keeps
   * sharing one column per day.
   */
  const splitWeek = isWeek && !showAllStaff;

  const days = weekAt(weekOffset);
  // Only this week's bookings; a booking carries the week it belongs to.
  const apptsIn = (d: number, s: number | null) =>
    layout(
      effAppts.filter(
        (a) => a.d === d && (a.w ?? 0) === weekOffset && (s === null ? true : fittersOf(a).includes(s)),
      ),
    );

  const dayGroups: DayGroup[] = isWeek
    ? days.map((info, d) => ({
        d,
        title: info.short,
        sub: info.date,
        fullSub: `${info.long}, ${info.date}`,
        today: weekOffset === 0 && d === TODAY_IDX,
        past: info.past,
        leaves: splitWeek
          ? visibleStaff.map((si) => ({
              key: `w:${d}:${si}`,
              d,
              s: si,
              today: weekOffset === 0 && d === TODAY_IDX,
              past: info.past,
              shift: STAFF[si].shift,
              brk: STAFF[si].brk,
              appts: apptsIn(d, si),
            }))
          : [
              {
                key: `w:${d}`,
                d,
                s: null,
                today: weekOffset === 0 && d === TODAY_IDX,
                past: info.past,
                shift: SHOP_HOURS,
                brk: null,
                appts: apptsIn(
                  d,
                  null,
                ),
              },
            ],
      }))
    : [];

  const leaves: Leaf[] = isWeek
    ? dayGroups.flatMap((g) => g.leaves)
    : visibleStaff.map((si) => ({
        key: `d:${si}`,
        d: selDay,
        s: si,
        today: false,
        past: false,
        shift: STAFF[si].shift,
        brk: STAFF[si].brk,
        // A booking with more than one fitter is drawn in each of their columns:
        // they are all busy for it. Only the lead's copy is draggable.
        appts: apptsIn(selDay, si),
      }));

  /**
   * A fitter keeps one width across every day of the week, so the day groups stay
   * aligned; day view keeps a width per fitter as before.
   */
  const widthKey = (leaf: Leaf) =>
    isWeek ? (leaf.s === null ? `week:${leaf.d}` : `week:s${leaf.s}`) : `day:${leaf.s}`;

  /**
   * Untouched columns share the viewport evenly so a wide window fills edge to
   * edge. A column the user has resized keeps exactly the width they set — including
   * narrower than an even share, which leaves canvas to the right.
   */
  const base = splitWeek ? SPLIT_WEEK_WIDTH : DEFAULT_WIDTH[view];
  const minWidth = splitWeek ? SPLIT_MIN_WIDTH : MIN_WIDTH;
  const autoWidth = Math.max(
    base,
    leaves.length > 0 ? Math.floor((viewportW - GRID.GUTTER) / leaves.length) : 0,
  );
  const widthOf = (leaf: Leaf) => colW[widthKey(leaf)] ?? autoWidth;
  const groupWidth = (g: DayGroup) => g.leaves.reduce((sum, l) => sum + widthOf(l), 0);
  const gridWidth = GRID.GUTTER + leaves.reduce((sum, l) => sum + widthOf(l), 0);

  // ---- interactions ------------------------------------------------------

  const startResize = (e: MouseEvent<HTMLDivElement>, leaf: Leaf) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    // Pin every column at its current width before the first drag, so taking manual
    // control of one column doesn't make the others jump to a different default.
    const pinned: Record<string, number> = {};
    for (const l of leaves) {
      const k = widthKey(l);
      if (colW[k] === undefined) pinned[k] = autoWidth;
    }
    if (Object.keys(pinned).length > 0) setColWidths(pinned);
    resizeRef.current = { key: widthKey(leaf), x: e.clientX, w: widthOf(leaf), min: minWidth };
  };

  const startDrag = (e: MouseEvent<HTMLDivElement>, a: LaidOutAppt) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDrag({ id: a.id, grabDy: e.clientY - rect.top, d: a.d, s: a.s, st: a.st, du: a.du, moved: false, x0: e.clientX, y0: e.clientY });
  };

  /** Pressing empty grid space begins a custom time window. */
  const startSelection = (e: MouseEvent<HTMLDivElement>, leaf: Leaf) => {
    if (e.button !== 0 || drag) return;
    if (e.target !== e.currentTarget) return; // ignore presses that land on a block
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    selRectRef.current = rect;
    const m = minsAtOffset(e.clientY, rect.top);
    setSelection({ col: leaf.key, d: leaf.d, s: leaf.s, anchor: m, from: m, to: m + GRID.SNAP });
  };

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const rz = resizeRef.current;
      if (rz) {
        setColWidth(rz.key, Math.max(rz.min, Math.min(MAX_WIDTH, rz.w + (e.clientX - rz.x))));
      }

      const d = useScheduler.getState().drag;
      if (d) {
        // ignore pointer jitter so a plain click still opens the appointment
        if (!d.moved && Math.abs(e.clientX - d.x0) < JITTER && Math.abs(e.clientY - d.y0) < JITTER) return;
        const cols = Array.from(document.querySelectorAll<HTMLElement>('[data-schedcol]')).map((el) => ({
          day: Number(el.dataset.schedday),
          staff: el.dataset.schedstaff === '' ? null : Number(el.dataset.schedstaff),
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
          // A column that pools every fitter says nothing about who, so the
          // booking keeps the fitter it already had.
          const nextD = hit.day;
          const nextS = hit.staff ?? d.s;
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
        startBooking(s.d, s.s, s.from, s.moved ? s.to - s.from : null);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [setColWidth, setDrag, setSelection, commitDrag, startBooking]);

  // Open the view just before the earliest shift rather than at 6 AM.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const earliest = Math.min(...STAFF.map((s) => s.shift[0]));
    el.scrollTop = Math.max(0, minsToPx(earliest - 45));
  }, []);

  const nowMin = minutesSinceMidnight();
  const showNow =
    !isWeek && weekOffset === 0 && selDay === TODAY_IDX && nowMin >= GRID_START_MIN && nowMin <= GRID_END_MIN;

  return (
    <div className="grid" ref={scrollerRef}>
      <div className="grid__inner" style={{ width: gridWidth }}>
        <div className={`grid__head${splitWeek ? ' grid__head--split' : ''}`}>
          <div className="grid__head-gutter" />

          {isWeek
            ? dayGroups.map((g) => {
                const width = groupWidth(g);
                return (
                  <div
                    className={`day-group${g.today ? ' day-group--today' : ''}${g.past ? ' day-group--past' : ''}`}
                    key={g.d}
                    style={{ flex: `0 0 ${width}px`, width }}
                  >
                    <div className="day-group__head" title={g.fullSub}>
                      <span
                        className={`col-head__title${g.today ? ' col-head__title--today' : ''}${g.past ? ' col-head__title--past' : ''}`}
                      >
                        {g.title}
                      </span>
                      <span className="col-head__sub">{g.sub}</span>
                    </div>

                    {/* Only a split week needs a second row naming the fitters. */}
                    {splitWeek && (
                      <div className="day-group__fitters">
                        {g.leaves.map((leaf) => {
                          const s = STAFF[leaf.s!];
                          const w = widthOf(leaf);
                          return (
                            <div
                              className="fitter-head"
                              key={leaf.key}
                              title={`${s.name} · ${s.role}`}
                              style={{ flex: `0 0 ${w}px`, width: w }}
                            >
                              <Avatar initials={s.initials} color={s.dot} size={18} fontSize={8} />
                              <span className="fitter-head__name">{s.name.split(' ')[0]}</span>
                              <div
                                className="col-head__resize"
                                title="Drag to resize this fitter's columns"
                                onMouseDown={(e) => startResize(e, leaf)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!splitWeek && (
                      <div
                        className="col-head__resize"
                        title="Drag to resize column"
                        onMouseDown={(e) => startResize(e, g.leaves[0])}
                      />
                    )}
                  </div>
                );
              })
            : leaves.map((leaf) => {
                const s = STAFF[leaf.s!];
                const width = widthOf(leaf);
                return (
                  <div className="col-head" key={leaf.key} style={{ flex: `0 0 ${width}px`, width }}>
                    <Avatar initials={s.initials} color={s.dot} size={24} fontSize={10} />
                    <div style={{ flex: 1, minWidth: 0 }} title={`${s.name} · ${s.role}`}>
                      <div className="col-head__title">{s.name}</div>
                      <div className="col-head__sub">{s.role}</div>
                    </div>
                    {width >= SHIFT_LABEL_MIN_WIDTH && (
                      <span className="col-head__shift">
                        {fmtShort(s.shift[0])}–{fmtShort(s.shift[1], true)}
                      </span>
                    )}
                    <div
                      className="col-head__resize"
                      title="Drag to resize column"
                      onMouseDown={(e) => startResize(e, leaf)}
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
            {leaves.map((leaf, i) => {
              const width = widthOf(leaf);
              const selected = sel?.col === leaf.key ? sel : null;
              // A walk-in being dragged in from the queue previews where it would land.
              const incoming =
                walkInDrag?.over &&
                walkInDrag.over.d === leaf.d &&
                (leaf.s === null || walkInDrag.over.s === leaf.s)
                  ? walkInDrag
                  : null;
              // The last column of a day is followed by the next day, so it carries
              // the heavier rule that separates them.
              const endsDay = isWeek && (leaves[i + 1]?.d ?? -1) !== leaf.d;
              return (
                <div
                  className={`sched-col${endsDay ? ' sched-col--day-end' : ''}`}
                  key={leaf.key}
                  data-schedcol={isWeek ? leaf.d : leaf.s}
                  data-schedday={leaf.d}
                  data-schedstaff={leaf.s === null ? '' : leaf.s}
                  title="Click or drag an empty slot to book"
                  style={{ flex: `0 0 ${width}px`, width, height: durToPx(GRID.HOURS * 60) }}
                  onMouseDown={(e) => startSelection(e, leaf)}
                >
                  <div className="band band--shift" style={bandStyle(leaf.shift[0], leaf.shift[1])} />
                  {leaf.brk && <div className="band band--break" style={bandStyle(leaf.brk[0], leaf.brk[1])} />}

                  {selected && (
                    <div className="selection" style={bandStyle(selected.from, selected.to)}>
                      {rangeLabel(selected.from, selected.to)}
                    </div>
                  )}

                  {incoming?.over && (
                    <div className="ghost" style={bandStyle(incoming.over.st, incoming.over.st + incoming.du)}>
                      <span className="ghost__name">{incoming.label}</span>
                      <span className="ghost__time">
                        {rangeLabel(incoming.over.st, incoming.over.st + incoming.du)}
                        {leaf.s === null && ` · ${STAFF[incoming.over.s].name}`}
                      </span>
                    </div>
                  )}

                  {leaf.appts.map((a) => {
                    // In an assisting fitter's column the block is a second view of
                    // the same booking: it opens, but it is rescheduled from the lead's
                    // column, so there is only ever one thing to drag.
                    const lead = leaf.s === null || a.s === leaf.s;
                    return (
                      <AppointmentBlock
                        key={a.id}
                        appt={a}
                        conflict={clash.has(a.id)}
                        dragging={lead && drag?.id === a.id}
                        assisting={!lead}
                        onMouseDown={lead ? (e) => startDrag(e, a) : undefined}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (draggedRef.current === a.id) return;
                          openDetail(a.id);
                        }}
                      />
                    );
                  })}
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
