import { CalendarCheck, EllipsisVertical, Globe, Trash2, X } from 'lucide-react';
import { STAFF } from '../../data/catalogue';
import { formatBookedAt, initialsOf } from '../../lib/dates';
import { useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import { Badge, Button } from '../ui/primitives';
import { useEscape, useOutsideClick } from '../ui/hooks';
import { AppointmentTab } from './AppointmentTab';
import { CompleteDialog } from './CompleteDialog';
import { EquipmentTab } from './EquipmentTab';
import { FittingTab } from './FittingTab';
import { PaymentControl } from './PaymentControl';
import { useDetail } from './useDetail';
import type { BadgeVariant } from '../ui/primitives';
import type { BookingSource, CheckInSource, DetailTab } from '../../types';

const TAB_LABELS = ['Appointment', 'Fitting', 'Equipment'];

const STATUS_VARIANT: Record<'today' | 'past' | 'upcoming' | 'waiting', BadgeVariant> = {
  today: 'default',
  past: 'success',
  upcoming: 'secondary',
  waiting: 'warning',
};

/**
 * How a booking reached the diary: a named staff member, the website, or
 * internally. Doubles as the walk-in check-in source, where `'self'` means they
 * checked themselves in at the portal.
 */
function describeSource(via: BookingSource | CheckInSource) {
  if (via === 'self') return { kind: 'internal' as const, label: 'Self check in', initials: '', color: '' };
  if (via === 'online') return { kind: 'online' as const, label: 'Online', initials: '', color: '' };
  if (via === 'walkin') return { kind: 'internal' as const, label: 'Walk in', initials: '', color: '' };
  if (via === 'internal') return { kind: 'internal' as const, label: 'Internal', initials: '', color: '' };
  const staff = STAFF[via];
  if (!staff) return { kind: 'internal' as const, label: 'Unknown', initials: '', color: '' };
  return { kind: 'staff' as const, label: staff.name, initials: staff.initials ?? initialsOf(staff.name), color: staff.dot };
}

export function AppointmentDetailSheet() {
  const detail = useDetail();
  const detailTab = useScheduler((s) => s.detailTab);
  const apptMenu = useScheduler((s) => s.apptMenu);
  const showComplete = useScheduler((s) => s.showComplete);
  const closeDetail = useScheduler((s) => s.closeDetail);
  const setDetailTab = useScheduler((s) => s.setDetailTab);
  const toggleApptMenu = useScheduler((s) => s.toggleApptMenu);
  const closeApptMenu = useScheduler((s) => s.closeApptMenu);
  const openComplete = useScheduler((s) => s.openComplete);
  const rescheduleAppt = useScheduler((s) => s.rescheduleAppt);
  const deleteAppt = useScheduler((s) => s.deleteAppt);

  const menuRef = useOutsideClick<HTMLDivElement>(apptMenu, closeApptMenu);
  useEscape(!showComplete, closeDetail);

  if (!detail) return null;

  const { appt, type, isMeeting, isWalkIn, status, totals } = detail;
  // Meeting blocks are internal — one Details tab, no fitting or equipment.
  const tabs = isMeeting ? ['Details'] : TAB_LABELS;
  const activeTab: DetailTab = isMeeting ? 0 : detailTab;
  // A walk-in has no booking source; who checked them in is the equivalent fact.
  const source = describeSource(isWalkIn ? detail.checkedInBy! : appt.bookedVia);

  return (
    <>
      <div className="backdrop" onClick={closeDetail}>
        <div
          className="sheet"
          role="dialog"
          aria-modal="true"
          aria-label={`${type.label} appointment`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sheet__accent" style={{ background: type.border }} />

          <div className="detail__head">
            <div className="detail__title-row">
              <div className="detail__heading">
                <h2 className="detail__title">{isMeeting ? appt.c : type.label}</h2>
                <Badge variant={STATUS_VARIANT[status.modifier]}>{status.label}</Badge>
              </div>

              {/* When and how it arrived, opposite the name. A walk-in has no booking
                  to date — what matters is when they checked in and who did it. */}
              <div className="booked-meta">
                <span className="booked-meta__label">{isWalkIn ? 'Walk in' : 'Booked'}</span>
                <span className="booked-meta__value">
                  {formatBookedAt(isWalkIn ? detail.checkedInAt! : appt.bookedAt)}
                  <span className="booked-meta__sep" aria-hidden>
                    ·
                  </span>
                  {source.kind === 'staff' ? (
                    <span className="booked-meta__staff">
                      <Avatar initials={source.initials} color={source.color} size={18} fontSize={8} />
                      {source.label}
                    </span>
                  ) : (
                    <Badge variant={source.kind === 'online' ? 'default' : 'secondary'}>
                      {source.kind === 'online' && <Globe size={12} strokeWidth={2.2} />}
                      {source.label}
                    </Badge>
                  )}
                </span>
              </div>

              <Button variant="ghost" size="icon" aria-label="Close" onClick={closeDetail}>
                <X size={16} strokeWidth={2} />
              </Button>
            </div>

            <div className="detail__tabs" role="tablist">
              {tabs.map((label, i) => (
                <button
                  className={`detail__tab${i === activeTab ? ' detail__tab--on' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={i === activeTab}
                  key={label}
                  onClick={() => setDetailTab(i as DetailTab)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="detail__body">
            {activeTab === 0 && <AppointmentTab detail={detail} />}
            {activeTab === 1 && !isMeeting && <FittingTab detail={detail} />}
            {activeTab === 2 && !isMeeting && <EquipmentTab detail={detail} />}
          </div>

          <div className="totals">
            <div style={{ flex: '0 0 auto' }}>
              <div className="totals__label">Balance due</div>
              <div className="totals__balance">{totals.balance}</div>
            </div>
            {/* What it is made of on the left, what it comes to on the right —
                two columns rather than four lines, so the bar stays short. */}
            <dl className="totals__split">
              <div className="totals__line">
                <dt>{totals.service ? totals.service.name : 'Appointment'}</dt>
                <dd>{totals.servicePrice}</dd>
              </div>
              <div className="totals__line">
                <dt>Equipment</dt>
                <dd>{totals.extras}</dd>
              </div>
            </dl>
            <dl className="totals__split">
              <div className="totals__line">
                <dt>Subtotal</dt>
                <dd>{totals.subtotal}</dd>
              </div>
              <div className="totals__line">
                <dt>Paid</dt>
                <dd className="is-paid">{totals.paid}</dd>
              </div>
            </dl>
            {!isMeeting && <PaymentControl totals={totals} />}
            <div style={{ flex: 1 }} />
            <div className="popover-anchor" ref={menuRef}>
              <button className="complete-btn" type="button" onClick={openComplete}>
                Appointment Complete
              </button>
              <button
                className="complete-btn__more"
                type="button"
                title="More actions"
                aria-label="More actions"
                aria-expanded={apptMenu}
                onClick={toggleApptMenu}
              >
                <EllipsisVertical size={16} strokeWidth={2.4} />
              </button>
              {apptMenu && (
                <div className="appt-menu">
                  <button className="appt-menu__item" type="button" onClick={rescheduleAppt}>
                    <CalendarCheck size={16} strokeWidth={2} color="var(--n-600)" />
                    Reschedule
                  </button>
                  <button className="appt-menu__item appt-menu__item--danger" type="button" onClick={deleteAppt}>
                    <Trash2 size={16} strokeWidth={2} />
                    Delete appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showComplete && <CompleteDialog detail={detail} />}
    </>
  );
}
