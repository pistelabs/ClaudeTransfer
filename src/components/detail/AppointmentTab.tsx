import { Activity, Calendar, Check, Clock, Mail, Phone, User, Users } from 'lucide-react';
import { STAFF } from '../../data/catalogue';
import { rangeLabel } from '../../lib/time';
import { DAY_INFO, useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import type { DetailInfo } from './useDetail';

export function AppointmentTab({ detail }: { detail: DetailInfo }) {
  const { appt, type, isMeeting, party } = detail;
  const checkins = useScheduler((s) => s.checkins);
  const checkIn = useScheduler((s) => s.checkIn);
  const records = useScheduler((s) => s.records);

  const day = DAY_INFO[appt.d];
  const buffer = [appt.bb ? `${appt.bb} min before` : '', appt.ba ? `${appt.ba} min after` : '']
    .filter(Boolean)
    .join('  ·  ');
  const rec = records[appt.id];
  const bookedBy = rec?.bookedBy != null ? STAFF[rec.bookedBy].name : (appt.by ?? 'Front desk');
  const fitter = STAFF[appt.s];

  return (
    <div>
      <div className="section-label">Appointment</div>
      <div className="detail__facts">
        <div className="detail__fact">
          <Calendar size={16} strokeWidth={2} color="var(--n-400)" />
          {day.long}, {day.date}, {day.year}
        </div>
        <div className="detail__fact">
          <Clock size={16} strokeWidth={2} color="var(--n-400)" />
          {rangeLabel(appt.st, appt.st + appt.du)}&nbsp; · &nbsp;{appt.du} min
        </div>
        {!!buffer && (
          <div className="detail__fact">
            <Activity size={16} strokeWidth={2} color="var(--n-400)" />
            Buffer {buffer}
          </div>
        )}
        {isMeeting ? (
          <div className="detail__fact">
            <Users size={16} strokeWidth={2} color="var(--n-400)" />
            Internal — no customer
          </div>
        ) : (
          <>
            <div className="detail__fact">
              <Avatar initials={fitter.initials} color={fitter.dot} size={28} fontSize={10.5} />
              <span>
                {fitter.name} · {fitter.role}
              </span>
            </div>
            <div className="detail__fact">
              <User size={16} strokeWidth={2} color="var(--n-400)" />
              Booked by {bookedBy}
            </div>
          </>
        )}
      </div>

      {isMeeting ? (
        <div>
          <div className="section-label" style={{ marginTop: 22 }}>
            Attendees
          </div>
          <div className="detail__attendees">{detail.attendees}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          {party.map((p) => {
            const stamp = checkins[p.key];
            return (
              <div className="cust-box" key={p.key}>
                <Avatar initials={p.initials} color={type.border} size={30} fontSize={11} />
                <div className="cust-box__name">{p.name}</div>
                <div className="cust-box__contact">
                  {p.customer?.email && p.customer.email !== '—' && (
                    <span className="cust-box__contact-item">
                      <Mail size={14} strokeWidth={2} color="var(--n-400)" />
                      <span>{p.customer.email}</span>
                    </span>
                  )}
                  {p.customer?.phone && p.customer.phone !== '—' && (
                    <span className="cust-box__contact-item">
                      <Phone size={14} strokeWidth={2} color="var(--n-400)" />
                      {p.customer.phone}
                    </span>
                  )}
                </div>
                {/* Check-in timestamps the arrival and unlocks the staff assessment. */}
                {stamp ? (
                  <span className="checkin-stamp">
                    <Check size={15} strokeWidth={2.4} />
                    Checked in {stamp}
                  </span>
                ) : (
                  <button className="checkin-btn" type="button" onClick={() => checkIn(p.key)}>
                    <Check size={15} strokeWidth={2.2} />
                    Check in
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
