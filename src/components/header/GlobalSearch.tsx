import { Search, X } from 'lucide-react';
import { STAFF, TYPES } from '../../data/catalogue';
import { initialsOf, weekAt } from '../../lib/dates';
import { useScheduler } from '../../store/useScheduler';
import { partyOf } from '../../lib/schedule';
import { rangeLabel } from '../../lib/time';
import type { Appointment } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useOutsideClick } from '../ui/hooks';

const MAX_RESULTS = 8;

/** Matches customer names (every party member), service label and booking id. */
function matchAppointments(appts: Appointment[], query: string): Appointment[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return appts
    .filter((a) => {
      if (a.t === 'MT') return false;
      const names = partyOf(a).join(' ');
      const label = TYPES[a.t]?.label ?? a.t;
      return `${names} ${label} ${a.id}`.toLowerCase().includes(q);
    })
    .slice(0, MAX_RESULTS);
}

export function GlobalSearch() {
  const searchQ = useScheduler((s) => s.searchQ);
  const searchOpen = useScheduler((s) => s.searchOpen);
  const appts = useScheduler((s) => s.appts);
  const setSearch = useScheduler((s) => s.setSearch);
  const setSearchOpen = useScheduler((s) => s.setSearchOpen);
  const openDetail = useScheduler((s) => s.openDetail);
  const setView = useScheduler((s) => s.setView);
  const setSelDay = useScheduler((s) => s.setSelDay);

  const open = searchOpen && !!searchQ.trim();
  const ref = useOutsideClick<HTMLDivElement>(open, () => setSearchOpen(false));
  const results = open ? matchAppointments(appts, searchQ) : [];

  /** Jumps to the day the booking sits on and opens its detail sheet. */
  const goTo = (a: Appointment) => {
    setSearchOpen(false);
    setView('day');
    setSelDay(a.d);
    openDetail(a.id);
  };

  return (
    <div className="search" ref={ref}>
      <Search className="search__icon" size={15} strokeWidth={2} aria-hidden />
      <input
        className="search__input"
        value={searchQ}
        placeholder="Search bookings…"
        aria-label="Search bookings"
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => searchQ && setSearchOpen(true)}
      />
      {!!searchQ && (
        <button className="search__clear" type="button" aria-label="Clear search" onClick={() => setSearch('')}>
          <X size={12} strokeWidth={2.4} />
        </button>
      )}

      {open && (
        <div className="search__results" role="listbox">
          {results.length === 0 && <div className="search__empty">No matches for “{searchQ}”</div>}
          {results.map((a) => {
            const type = TYPES[a.t];
            const names = partyOf(a);
            return (
              <button className="search__row" type="button" key={a.id} onClick={() => goTo(a)}>
                <Avatar initials={initialsOf(names[0])} color={type.border} size={30} fontSize={11} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="search__name">{names.join(', ')}</span>
                  <span className="search__meta">
                    {type.label}&nbsp; · &nbsp;{weekAt(a.w ?? 0)[a.d].long} {weekAt(a.w ?? 0)[a.d].date}&nbsp; · &nbsp;
                    {rangeLabel(a.st, a.st + a.du)}&nbsp; · &nbsp;{STAFF[a.s].name}
                  </span>
                </span>
                <span className="search__ref">{a.id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
