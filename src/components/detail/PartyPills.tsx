import { useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import type { DetailInfo } from './useDetail';

/** Person switcher for the Fitting and Equipment tabs; hidden for single-customer bookings. */
export function PartyPills({ detail, showNote = false }: { detail: DetailInfo; showNote?: boolean }) {
  const setDetailCust = useScheduler((s) => s.setDetailCust);
  const { party, custIdx, type } = detail;

  if (party.length <= 1) return null;

  return (
    <div className="party-pills">
      {party.map((p, i) => {
        const on = i === custIdx;
        return (
          <button
            className={`party-pill${on ? ' party-pill--on' : ''}`}
            type="button"
            key={p.key}
            aria-pressed={on}
            onClick={() => setDetailCust(i)}
          >
            <Avatar initials={p.initials} color={on ? type.border : 'var(--n-350)'} size={22} fontSize={9.5} />
            {p.name}
          </button>
        );
      })}
      {showNote && <span className="party-note">{party.length} customers on this booking</span>}
    </div>
  );
}
