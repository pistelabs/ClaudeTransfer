import { useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { STAFF } from '../../data/catalogue';
import { slotOpen, slotsFor } from '../../lib/schedule';
import { parseTime } from '../../lib/time';
import { useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import { Label } from '../ui/primitives';
import { useOutsideClick } from '../ui/hooks';

const ROW_H = 52;

/**
 * Avatar-row dropdown listing every fitter with live availability for the chosen
 * slot. Busy fitters are dimmed but still selectable — availability is a note,
 * not a block, so in-store staff can override.
 */
export function FitterPicker() {
  const form = useScheduler((s) => s.form);
  const svcStep = useScheduler((s) => s.svcStep);
  const appts = useScheduler((s) => s.appts);
  const open = useScheduler((s) => s.staffOpen);
  const up = useScheduler((s) => s.staffUp);
  const setFormStaff = useScheduler((s) => s.setFormStaff);
  const setStaffOpen = useScheduler((s) => s.setStaffOpen);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useOutsideClick<HTMLDivElement>(open, () => setStaffOpen(false));

  const staffSel = form.staff;
  const startMin = parseTime(form.time);
  const onTimeStep = svcStep === 'time';

  const isFree = (si: number) =>
    onTimeStep
      ? slotOpen(appts, si, form.day, startMin, form.dur)
      : slotsFor(appts, si, form.day, form.dur).some((x) => x.ok);

  /** Flips the menu above the trigger when there isn't room below. */
  const toggle = () => {
    const el = triggerRef.current;
    let flip = false;
    if (el) {
      const r = el.getBoundingClientRect();
      const needed = Math.min(5, STAFF.length + 1) * ROW_H + 16;
      flip = r.bottom + needed > window.innerHeight && r.top - needed > 0;
    }
    setStaffOpen(!open, flip);
  };

  const selected = staffSel === null ? null : STAFF[staffSel];

  const rows = [{ idx: null as number | null, name: 'Unassigned', role: 'Any available staff member', initials: '?', dot: null as string | null, free: true }].concat(
    STAFF.map((s, si) => ({ idx: si, name: s.name, role: s.role, initials: s.initials, dot: s.dot, free: isFree(si) })),
  );

  return (
    <div className="fitter-field">
      <Label htmlFor="booking-fitter">Bootfitter</Label>
      <div className="fitter" ref={wrapRef}>
        <button
          className="fitter__trigger"
          type="button"
          id="booking-fitter"
          ref={triggerRef}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={toggle}
        >
          <Avatar
            initials={selected ? selected.initials : '?'}
            color={selected?.dot}
            size={26}
            fontSize={10}
            unassigned={!selected}
          />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="fitter__name">{selected ? selected.name : 'Unassigned'}</span>
            <span className="fitter__sub">{selected ? selected.role : 'Any available staff member'}</span>
          </span>
          <ChevronDown size={16} strokeWidth={2} color="var(--n-350)" />
        </button>

        {open && (
          <div className={`fitter__menu fitter__menu--${up ? 'up' : 'down'}`} role="listbox">
            {rows.map((r) => (
              <button
                className={[
                  'fitter__row',
                  staffSel === r.idx ? 'fitter__row--sel' : '',
                  r.free ? '' : 'fitter__row--busy',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                key={r.name}
                onClick={() => setFormStaff(r.idx)}
              >
                <Avatar
                  initials={r.initials}
                  color={r.dot ?? undefined}
                  size={32}
                  fontSize={11.5}
                  unassigned={!r.dot}
                />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="fitter__name" style={{ fontSize: 13 }}>
                    {r.name}
                  </span>
                  <span className="fitter__sub">{r.idx === null || r.free ? r.role : `${r.role} · unavailable`}</span>
                </span>
                <ChevronRight size={15} strokeWidth={2} color="var(--n-300)" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
