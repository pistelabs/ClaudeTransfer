import { Activity, Calendar, Check, Clock, Hourglass, Mail, Phone, UserCheck, UserCog, Users } from 'lucide-react';
import { formatBookedAt } from '../../lib/dates';
import { checkInLabel } from '../../lib/schedule';
import { durationLabel, rangeLabel } from '../../lib/time';
import { DAY_INFO, useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataRow } from '../ui/primitives';
import { FitterSelect } from './FitterSelect';
import type { DetailInfo } from './useDetail';

const ICON = { size: 15, strokeWidth: 2, color: 'var(--n-400)' } as const;

export function AppointmentTab({ detail }: { detail: DetailInfo }) {
  const { appt, type, isMeeting, isWalkIn, party } = detail;
  const checkins = useScheduler((s) => s.checkins);
  const checkIn = useScheduler((s) => s.checkIn);

  const day = DAY_INFO[appt.d];
  const buffer = [appt.bb ? `${appt.bb} min before` : '', appt.ba ? `${appt.ba} min after` : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="detail__stack">
      <Card>
        <CardHeader>
          <CardTitle>{isMeeting ? 'Meeting details' : isWalkIn ? 'Walk-in details' : 'Appointment details'}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Date beside time, duration beside buffer, the fitter on its own row below.
              A walk-in has none of the scheduling facts — that is what makes it one. */}
          <dl className="detail__facts">
            {!isWalkIn && (
              <DataRow icon={<Calendar {...ICON} />} label="Date">
                {day.long}, {day.date}, {day.year}
              </DataRow>
            )}
            {!isWalkIn && (
              <DataRow icon={<Clock {...ICON} />} label="Time">
                {rangeLabel(appt.st, appt.st + appt.du)}
              </DataRow>
            )}
            {isWalkIn && (
              <DataRow icon={<Clock {...ICON} />} label="Checked in">
                {formatBookedAt(detail.checkedInAt!)}
              </DataRow>
            )}
            {isWalkIn && (
              <DataRow icon={<UserCheck {...ICON} />} label="Checked in by">
                {checkInLabel(detail.checkedInBy!)}
              </DataRow>
            )}
            <DataRow icon={<Hourglass {...ICON} />} label={isWalkIn ? 'Expected' : 'Duration'}>
              {durationLabel(appt.du)}
            </DataRow>
            {!isWalkIn && !!buffer && (
              <DataRow icon={<Activity {...ICON} />} label="Buffer">
                {buffer}
              </DataRow>
            )}
            {isWalkIn && (
              <DataRow icon={<UserCog {...ICON} />} label="Bootfitter">
                <Badge variant="secondary">Unassigned</Badge>
              </DataRow>
            )}
            {!isMeeting && !isWalkIn && (
              <DataRow icon={<UserCog {...ICON} />} label="Bootfitter" control full>
                <FitterSelect current={appt.s} />
              </DataRow>
            )}
          </dl>
        </CardContent>
      </Card>

      {isMeeting ? (
        <Card>
          <CardHeader>
            <CardTitle>Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="detail__attendees">
              <Users size={15} strokeWidth={2} color="var(--n-400)" />
              {detail.attendees}
            </div>
            <Badge variant="secondary">Internal — no customer</Badge>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{party.length > 1 ? `Customers (${party.length})` : 'Customer'}</CardTitle>
            </CardHeader>
            <CardContent>
              {party.map((p) => {
                const stamp = checkins[p.key];
                return (
                  <div className="cust-box" key={p.key}>
                    <Avatar initials={p.initials} color={type.border} size={34} fontSize={12} />
                    <div className="cust-box__identity">
                      <span className="cust-box__name">{p.name}</span>
                      <span className="cust-box__contact">
                        {p.customer?.email && p.customer.email !== '—' && (
                          <span className="cust-box__contact-item">
                            <Mail size={13} strokeWidth={2} color="var(--n-400)" />
                            <span>{p.customer.email}</span>
                          </span>
                        )}
                        {p.customer?.phone && p.customer.phone !== '—' && (
                          <span className="cust-box__contact-item">
                            <Phone size={13} strokeWidth={2} color="var(--n-400)" />
                            {p.customer.phone}
                          </span>
                        )}
                      </span>
                    </div>
                    {/* Check-in timestamps the arrival and unlocks the staff assessment. */}
                    {stamp ? (
                      <Badge variant="success" className="cust-box__stamp">
                        <Check size={13} strokeWidth={2.6} />
                        Checked in {stamp}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => checkIn(p.key)}>
                        <Check size={15} strokeWidth={2.2} />
                        Check in
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {!!appt.n && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="detail__note">{appt.n}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
