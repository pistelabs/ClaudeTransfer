import { Check, ChevronDown } from 'lucide-react';
import { STAFF } from '../../data/catalogue';
import { useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import { useOutsideClick } from '../ui/hooks';

/**
 * Reassigns the fitter on an open appointment. Lives in the Appointment tab
 * rather than the sheet header so it reads as an editable field, not chrome.
 */
export function FitterSelect({ current }: { current: number }) {
  const open = useScheduler((s) => s.detailStaffOpen);
  const setOpen = useScheduler((s) => s.setDetailStaffOpen);
  const reassign = useScheduler((s) => s.reassignFitter);

  const ref = useOutsideClick<HTMLDivElement>(open, () => setOpen(false));
  const fitter = STAFF[current];

  return (
    <div className="fitter-select" ref={ref}>
      <button
        className="fitter-select__trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Avatar initials={fitter.initials} color={fitter.dot} size={30} fontSize={11} />
        <span className="fitter-select__text">
          <span className="fitter-select__name">{fitter.name}</span>
          <span className="fitter-select__role">{fitter.role}</span>
        </span>
        <ChevronDown size={16} strokeWidth={2} color="var(--n-400)" />
      </button>

      {open && (
        <div className="fitter-select__menu" role="listbox">
          {STAFF.map((s, si) => {
            const on = si === current;
            return (
              <button
                className={`fitter-select__option${on ? ' fitter-select__option--on' : ''}`}
                type="button"
                role="option"
                aria-selected={on}
                key={s.name}
                onClick={() => reassign(si)}
              >
                <Avatar initials={s.initials} color={s.dot} size={28} fontSize={10.5} />
                <span className="fitter-select__text">
                  <span className="fitter-select__name">{s.name}</span>
                  <span className="fitter-select__role">{s.role}</span>
                </span>
                {on && <Check size={15} strokeWidth={2.4} color="var(--primary)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
