import type { CSSProperties, MouseEvent } from 'react';
import { TriangleAlert } from 'lucide-react';
import { STAFF, TYPES } from '../../data/catalogue';
import { durToPx, fmtTime, minsToPx, rangeLabel } from '../../lib/time';
import { fittersOf, partyOf } from '../../lib/schedule';
import type { LaidOutAppt } from '../../types';
import { Avatar } from '../ui/Avatar';

interface Props {
  appt: LaidOutAppt;
  conflict: boolean;
  dragging: boolean;
  /** drawn in a fitter's column who is assisting, not leading, this booking */
  assisting?: boolean;
  onMouseDown?: (e: MouseEvent<HTMLDivElement>) => void;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}

/** Horizontal slice of the column this block occupies, given overlap packing. */
function laneBox(appt: LaidOutAppt): CSSProperties {
  const w = 100 / appt.lanes;
  return { left: `calc(${appt.lane * w}% + 2px)`, width: `calc(${w}% - 5px)` };
}

/**
 * Buffer bands sit hard against the block in the same hue but hatched and
 * dotted, so they read as protected time rather than bookable work.
 */
function BufferBand({ appt, side }: { appt: LaidOutAppt; side: 'before' | 'after' }) {
  const mins = side === 'before' ? appt.bb : appt.ba;
  if (!mins) return null;
  const type = TYPES[appt.t];
  const from = side === 'before' ? appt.st - mins : appt.st + appt.du;
  return (
    <div
      className={`buffer buffer--${side}`}
      style={{
        ...laneBox(appt),
        top: minsToPx(from),
        height: durToPx(mins) - 1,
        color: type.text,
        background: `repeating-linear-gradient(135deg, ${type.bg} 0 5px, rgb(255 255 255 / 85%) 5px 10px)`,
        borderLeft: `3px dotted ${type.border}`,
      }}
    >
      {mins}m {side === 'before' ? 'prep' : 'buffer'}
    </div>
  );
}

export function AppointmentBlock({ appt, conflict, dragging, assisting, onMouseDown, onClick }: Props) {
  const type = TYPES[appt.t];
  const height = durToPx(appt.du);
  const short = height < 34;
  const tall = height >= 56;
  const names = partyOf(appt);
  const customer = names.join(', ');
  const team = fittersOf(appt);
  const teamNames = team.map((i) => STAFF[i].name).join(' and ');

  const className = [
    'appt',
    short ? 'appt--short' : '',
    conflict ? 'appt--conflict' : '',
    dragging ? 'appt--dragging' : '',
    assisting ? 'appt--assisting' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const tip = conflict
    ? `⚠ Double-booked — ${appt.c} · ${rangeLabel(appt.st, appt.st + appt.du)}`
    : assisting
      ? `${appt.c} · ${type.label} · ${rangeLabel(appt.st, appt.st + appt.du)}  (with ${teamNames} — reschedule from ${STAFF[appt.s].name}'s column)`
      : `${appt.c} · ${type.label} · ${rangeLabel(appt.st, appt.st + appt.du)}${
          team.length > 1 ? `  (with ${teamNames})` : ''
        }  (drag to reschedule)`;

  return (
    <>
      <BufferBand appt={appt} side="before" />
      <BufferBand appt={appt} side="after" />
      <div
        className={className}
        role="button"
        tabIndex={0}
        title={tip}
        style={{
          ...laneBox(appt),
          top: minsToPx(appt.st),
          height: height - 3,
          background: type.bg,
          color: type.text,
          borderLeft: `3px solid ${conflict ? 'var(--danger)' : type.border}`,
        }}
        onMouseDown={onMouseDown}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e as unknown as MouseEvent<HTMLDivElement>);
          }
        }}
      >
        {conflict && (
          <span className="appt__warn">
            <TriangleAlert size={13} strokeWidth={2} fill="#fff" />
          </span>
        )}
        {short ? (
          <div className="appt__time appt__time--one-line">
            {fmtTime(appt.st, false)} · {appt.c}
          </div>
        ) : (
          <>
            <div className="appt__time">{rangeLabel(appt.st, appt.st + appt.du)}</div>
            <div className="appt__customer">{customer}</div>
            {tall && <div className="appt__service">{type.label}</div>}
            {/* Whose booking this also is — a fitter scanning their own column needs
                to see they are sharing it, not just that they are busy. */}
            {tall && team.length > 1 && (
              <div className="appt__team">
                {team.map((i) => (
                  <Avatar key={i} initials={STAFF[i].initials} color={STAFF[i].dot} size={16} fontSize={7.5} />
                ))}
                <span className="appt__team-label">{team.length} fitters</span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
