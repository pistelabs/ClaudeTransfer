import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { STAFF } from '../../data/catalogue';
import { useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import { useOutsideClick } from '../ui/hooks';

/**
 * The fitters on an open appointment: the lead — whose column it sits in, and
 * who can be swapped — followed by anyone assisting. A booking can need two
 * pairs of hands, and everyone attached is busy for it, so the schedule draws
 * the block in each of their columns.
 */
export function FitterTeam({ lead, assist }: { lead: number; assist: number[] }) {
  const open = useScheduler((s) => s.detailStaffOpen);
  const setOpen = useScheduler((s) => s.setDetailStaffOpen);
  const addOpen = useScheduler((s) => s.detailAddFitterOpen);
  const setAddOpen = useScheduler((s) => s.setDetailAddFitterOpen);
  const reassign = useScheduler((s) => s.reassignFitter);
  const addFitter = useScheduler((s) => s.addFitter);
  const removeFitter = useScheduler((s) => s.removeFitter);

  const leadRef = useOutsideClick<HTMLDivElement>(open, () => setOpen(false));
  const addRef = useOutsideClick<HTMLDivElement>(addOpen, () => setAddOpen(false));
  const fitter = STAFF[lead];
  const attached = [lead, ...assist];
  const spare = STAFF.map((_, i) => i).filter((i) => !attached.includes(i));

  return (
    <div className="fitter-team">
      <div className="fitter-select" ref={leadRef}>
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
            <span className="fitter-select__role">{assist.length > 0 ? 'Lead · ' + fitter.role : fitter.role}</span>
          </span>
          <ChevronDown size={16} strokeWidth={2} color="var(--n-400)" />
        </button>

        {open && (
          <div className="fitter-select__menu" role="listbox">
            {STAFF.map((s, si) => {
              const on = si === lead;
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

      {assist.map((si) => {
        const s = STAFF[si];
        return (
          <span className="fitter-chip" key={si}>
            <Avatar initials={s.initials} color={s.dot} size={24} fontSize={9.5} />
            <span className="fitter-chip__name">{s.name}</span>
            <button
              className="fitter-chip__remove"
              type="button"
              title={`Take ${s.name} off this booking`}
              aria-label={`Take ${s.name} off this booking`}
              onClick={() => removeFitter(si)}
            >
              <X size={13} strokeWidth={2.4} />
            </button>
          </span>
        );
      })}

      {spare.length > 0 && (
        <div className="popover-anchor" ref={addRef}>
          <button
            className="fitter-add"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={addOpen}
            onClick={() => setAddOpen(!addOpen)}
          >
            <Plus size={14} strokeWidth={2.4} />
            Add fitter
          </button>

          {addOpen && (
            <div className="fitter-select__menu fitter-select__menu--add" role="listbox">
              {spare.map((si) => {
                const s = STAFF[si];
                return (
                  <button
                    className="fitter-select__option"
                    type="button"
                    role="option"
                    aria-selected={false}
                    key={s.name}
                    onClick={() => addFitter(si)}
                  >
                    <Avatar initials={s.initials} color={s.dot} size={28} fontSize={10.5} />
                    <span className="fitter-select__text">
                      <span className="fitter-select__name">{s.name}</span>
                      <span className="fitter-select__role">{s.role}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
