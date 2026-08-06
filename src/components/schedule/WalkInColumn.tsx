import { ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { TYPES } from '../../data/catalogue';
import { formatClockTime, initialsOf } from '../../lib/dates';
import { partyOf } from '../../lib/schedule';
import { durationLabel } from '../../lib/time';
import { useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';

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
        <button className="walkins__collapse" type="button" title="Hide checked in" onClick={toggle}>
          <ChevronLeft size={15} strokeWidth={2.2} />
        </button>
      </div>

      <div className="walkins__list">
        {walkIns.length === 0 ? (
          <div className="walkins__empty">
            <div className="empty-state__title">Nobody waiting</div>
            <div className="empty-state__body">Walk-ins who check in at the portal appear here.</div>
          </div>
        ) : (
          walkIns.map((w) => {
            const type = TYPES[w.t];
            const names = partyOf(w);
            return (
              <button
                className="walkin"
                type="button"
                key={w.id}
                style={{ borderLeftColor: type.border }}
                onClick={() => openDetail(w.id)}
              >
                <div className="walkin__head">
                  <Avatar initials={initialsOf(names[0])} color={type.border} size={26} fontSize={10} />
                  <span className="walkin__name">{names.join(', ')}</span>
                </div>
                <span className="walkin__service" style={{ color: type.text, background: type.bg }}>
                  {type.label}
                </span>
                <div className="walkin__meta">
                  <span className="walkin__since">Since {formatClockTime(w.checkedInAt)}</span>
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
