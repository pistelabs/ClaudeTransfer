import { Check, X } from 'lucide-react';
import { STAFF } from '../../data/catalogue';
import { DAY_INFO, useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import { Badge, Button, Label } from '../ui/primitives';
import { useEscape } from '../ui/hooks';

const LENGTHS = [
  { v: 15, label: '15 min' },
  { v: 30, label: '30 min' },
  { v: 45, label: '45 min' },
  { v: 60, label: '1 hr' },
];

/**
 * Team meetings reuse the booking shell but write one internal block per
 * attendee, so the meeting appears in every selected fitter's column.
 */
export function TeamMeetingDialog() {
  const meeting = useScheduler((s) => s.meeting);
  const setMeeting = useScheduler((s) => s.setMeeting);
  const toggleWho = useScheduler((s) => s.toggleMeetingWho);
  const toggleAll = useScheduler((s) => s.toggleMeetingAll);
  const save = useScheduler((s) => s.saveMeeting);
  const close = useScheduler((s) => s.closeMeeting);

  useEscape(true, close);

  const allOn = meeting.who.length === STAFF.length;
  const canSave = !!meeting.title.trim() && meeting.who.length > 0;

  return (
    <div className="dialog-backdrop" onClick={close}>
      <div
        className="dialog"
        style={{ width: 460 }}
        role="dialog"
        aria-modal="true"
        aria-label="Team meeting"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">Team meeting</div>
            <div className="dialog__sub">Blocks the selected fitters&rsquo; columns.</div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={close}>
            <X size={17} strokeWidth={2} />
          </Button>
        </div>

        <div style={{ marginTop: 18 }}>
          <Label htmlFor="mt-title">Title</Label>
          <input
            className="nc__input"
            id="mt-title"
            style={{ height: 40 }}
            value={meeting.title}
            placeholder="Morning huddle"
            onChange={(e) => setMeeting({ title: e.target.value })}
          />
        </div>

        <div className="meeting__row">
          <div style={{ flex: 1.4 }}>
            <Label htmlFor="mt-day">Day</Label>
            <select
              className="nc__input"
              id="mt-day"
              style={{ height: 40 }}
              value={meeting.day}
              onChange={(e) => setMeeting({ day: Number(e.target.value) })}
            >
              {DAY_INFO.map((d, i) => (
                <option value={i} key={d.short}>
                  {d.long} · {d.date}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <Label htmlFor="mt-time">Start</Label>
            <input
              className="nc__input"
              id="mt-time"
              style={{ height: 40 }}
              type="time"
              step={900}
              value={meeting.time}
              onChange={(e) => setMeeting({ time: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Label htmlFor="mt-dur">Length</Label>
            <select
              className="nc__input"
              id="mt-dur"
              style={{ height: 40 }}
              value={meeting.dur}
              onChange={(e) => setMeeting({ dur: Number(e.target.value) })}
            >
              {LENGTHS.map((l) => (
                <option value={l.v} key={l.v}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
            <Label>Attendees</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge variant={meeting.who.length > 0 ? 'outline' : 'secondary'}>
                {meeting.who.length} of {STAFF.length} selected
              </Badge>
              <button
                type="button"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '3px 4px', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-pressed={allOn}
                onClick={toggleAll}
              >
                <span className={`checkbox${allOn ? ' checkbox--on' : ''}`} style={{ width: 17, height: 17 }}>
                  <Check size={11} strokeWidth={3.2} />
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--n-800)' }}>Add all</span>
              </button>
            </div>
          </div>

          <div className="meeting__who">
            {STAFF.map((s, si) => {
              const on = meeting.who.includes(si);
              return (
                <button
                  className={`meeting__who-btn${on ? ' meeting__who-btn--on' : ''}`}
                  type="button"
                  key={s.name}
                  aria-pressed={on}
                  onClick={() => toggleWho(si)}
                >
                  <Avatar initials={s.initials} color={s.dot} size={26} fontSize={10} />
                  <span className="meeting__who-name">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="dialog__actions">
          <Button variant="outline" size="lg" onClick={close}>
            Cancel
          </Button>
          <Button size="lg" disabled={!canSave} onClick={save}>
            Add meeting
          </Button>
        </div>
      </div>
    </div>
  );
}
