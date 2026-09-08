import { Check, ChevronDown, Users } from 'lucide-react';
import { STAFF } from '../../data/catalogue';
import { useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import { useOutsideClick } from '../ui/hooks';

export function StaffFilter() {
  const staffFilter = useScheduler((s) => s.staffFilter);
  const open = useScheduler((s) => s.filterMenu);
  const toggleMenu = useScheduler((s) => s.toggleFilterMenu);
  const closeMenu = useScheduler((s) => s.closeFilterMenu);
  const toggleStaff = useScheduler((s) => s.toggleStaffFilter);
  const onlyStaff = useScheduler((s) => s.onlyStaff);
  const clearFilter = useScheduler((s) => s.clearStaffFilter);

  const showAll = staffFilter.length === 0;
  const ref = useOutsideClick<HTMLDivElement>(open, closeMenu);
  const label = showAll
    ? 'All staff'
    : staffFilter.length === 1
      ? STAFF[staffFilter[0]].name
      : `${staffFilter.length} staff`;

  return (
    <div className="popover-anchor" ref={ref}>
      <button
        className={`filter__btn${showAll ? '' : ' filter__btn--active'}`}
        type="button"
        aria-expanded={open}
        onClick={toggleMenu}
      >
        {label}
        <ChevronDown size={14} strokeWidth={2} />
      </button>

      {open && (
        <div className="filter__menu">
          <button className={`filter__row${showAll ? ' filter__row--all' : ''}`} type="button" onClick={clearFilter}>
            <span
              className="avatar"
              style={{ width: 28, height: 28, color: 'var(--n-550)', background: 'var(--n-60)' }}
            >
              <Users size={15} strokeWidth={2} />
            </span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--n-800)' }}>All staff</span>
          </button>

          {STAFF.map((s, si) => {
            const on = staffFilter.includes(si);
            return (
              <div className="filter__line" key={s.name}>
                <button
                  className={`filter__row${on ? ' filter__row--on' : ''}`}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleStaff(si)}
                >
                  <span className={`checkbox${on ? ' checkbox--on' : ''}`}>
                    <Check size={11} strokeWidth={3.2} />
                  </span>
                  <Avatar initials={s.initials} color={s.dot} size={28} fontSize={10.5} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="filter__name">{s.name}</span>
                    <span className="filter__role">{s.role}</span>
                  </span>
                </button>
                <button
                  className="filter__only"
                  type="button"
                  title="View only this staff member"
                  onClick={() => onlyStaff(si)}
                >
                  Only
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
