import { Activity, Calendar, Clock, Hourglass, Mail, Phone, UserCheck, UserCog, Users } from 'lucide-react';
import { formatBookedAt, weekAt } from '../../lib/dates';
import { checkInLabel } from '../../lib/schedule';
import { durationLabel, rangeLabel } from '../../lib/time';
import { Avatar } from '../ui/Avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataRow } from '@/components/ui/data-row';
import { FitterTeam } from './FitterTeam';
import { ReportCard } from './ReportCard';
import type { DetailInfo } from './useDetail';

const ICON = { size: 15, strokeWidth: 2, color: 'var(--n-400)' } as const;

export function AppointmentTab({ detail }: { detail: DetailInfo }) {
  const { appt, type, isMeeting, isWalkIn, party } = detail;
  const day = weekAt(appt.w ?? 0)[appt.d];
  const buffer = [appt.bb ? `${appt.bb} min before` : '', appt.ba ? `${appt.ba} min after` : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="detail__stack">
      {isMeeting ? (
        <>
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
              <DataRow
                icon={<UserCog {...ICON} />}
                label={appt.assistIds?.length ? `Bootfitters (${appt.assistIds.length + 1})` : 'Bootfitter'}
                control
                full
              >
                <FitterTeam lead={appt.staffId} assist={appt.assistIds ?? []} />
              </DataRow>
            )}
          </dl>
        </CardContent>
      </Card>

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
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{party.length > 1 ? `Customers (${party.length})` : 'Customer'}</CardTitle>
            </CardHeader>
            <CardContent>
              {party.map((p) => (
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
                </div>
              ))}
            </CardContent>
          </Card>

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
              <DataRow
                icon={<UserCog {...ICON} />}
                label={appt.assistIds?.length ? `Bootfitters (${appt.assistIds.length + 1})` : 'Bootfitter'}
                control
                full
              >
                <FitterTeam lead={appt.staffId} assist={appt.assistIds ?? []} />
              </DataRow>
            )}
          </dl>
        </CardContent>
      </Card>

          {/* what the customer goes home with, filled in when the booking is closed out */}
          {!isWalkIn && <ReportCard detail={detail} />}

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
