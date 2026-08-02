import { Check, ChevronLeft, CreditCard, FileText, Minus, Wrench, X } from 'lucide-react';
import { useScheduler, type SchedulerStore } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import { Badge, Button } from '../ui/primitives';
import { useEscape } from '../ui/hooks';
import type { DetailInfo } from './useDetail';

interface WorkshopRow {
  key: string;
  service: string;
  price: string;
  item: string;
  side: string;
  location: string;
  done: boolean;
}

/** Everything recorded on the equipment tab, grouped per customer. */
function workshopGroups(store: SchedulerStore, detail: DetailInfo) {
  return detail.party.map((p, i) => {
    const equipment = store.equipment[`${detail.appt.id}:${i}`] ?? [];
    const rows: WorkshopRow[] = equipment.flatMap((e) =>
      e.services.map((sv) => {
        const key = `${detail.appt.id}:${i}:${e.uid}:${sv.sid}`;
        return {
          key,
          service: sv.name.toUpperCase(),
          price: sv.price,
          item: e.kind + (e.model ? ` · ${e.model}` : ''),
          side: sv.side || 'Both',
          location: sv.location || '—',
          done: !!store.svcDone[key],
        };
      }),
    );
    return { member: p, rows };
  });
}

export function CompleteDialog({ detail }: { detail: DetailInfo }) {
  const store = useScheduler((s) => s as SchedulerStore);
  const { completeStep, pdfReport, saved, closeComplete, setCompleteStep, toggleSvcDone, togglePdf, finishComplete } =
    store;

  useEscape(true, closeComplete);

  const groups = workshopGroups(store, detail);
  const onReview = completeStep === 'review';

  const totalRows = groups.reduce((n, g) => n + g.rows.length, 0);
  const doneRows = groups.reduce((n, g) => n + g.rows.filter((r) => r.done).length, 0);

  return (
    <div className="dialog-backdrop dialog-backdrop--complete" onClick={closeComplete}>
      <div
        className="dialog"
        style={{ width: 520, padding: 24 }}
        role="dialog"
        aria-modal="true"
        aria-label="Complete appointment"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">Complete appointment</div>
            <div className="dialog__sub">{detail.type.label} work complete</div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={closeComplete}>
            <X size={17} strokeWidth={2} />
          </Button>
        </div>

        {onReview ? (
          <>
            <div className="complete__table">
              <div className="complete__thead">
                <span className="complete__th" style={{ flex: 1, minWidth: 0 }}>
                  Customer
                </span>
                <span className="complete__th" style={{ flex: '0 0 92px', textAlign: 'center' }}>
                  Fitting details
                </span>
                <span className="complete__th" style={{ flex: '0 0 96px', textAlign: 'center' }}>
                  Equipment details
                </span>
              </div>

              {detail.party.map((p, i) => {
                // Fitting ticks only when *both* question sets are marked complete.
                const hasFitting = !!saved[`${detail.appt.id}:c${i}`] && !!saved[`${detail.appt.id}:s${i}`];
                const equipment = store.equipment[`${detail.appt.id}:${i}`] ?? [];
                const hasEquipment = equipment.some((e) => e.model.trim() || e.size || e.services.length);
                return (
                  <div className="complete__row" key={p.key}>
                    <span className="complete__name">
                      <Avatar initials={p.initials} color={detail.type.border} size={28} fontSize={10.5} />
                      {p.name}
                    </span>
                    <span style={{ flex: '0 0 92px', display: 'flex', justifyContent: 'center' }}>
                      <Mark on={hasFitting} />
                    </span>
                    <span style={{ flex: '0 0 96px', display: 'flex', justifyContent: 'center' }}>
                      <Mark on={hasEquipment} />
                    </span>
                  </div>
                );
              })}
            </div>

            <button className="complete__pdf" type="button" aria-pressed={pdfReport} onClick={togglePdf}>
              <span className={`complete__pdf-box${pdfReport ? ' complete__pdf-box--on' : ''}`}>
                <Check size={12} strokeWidth={3.2} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--n-800)' }}>
                  Create PDF Report
                </span>
                <span style={{ display: 'block', marginTop: 2, fontSize: 11.5, color: 'var(--n-500)' }}>
                  Fitting and equipment summary for the customer
                </span>
              </span>
              <FileText size={16} strokeWidth={2} color="var(--n-350)" />
            </button>

            <Totals detail={detail} />

            <div className="complete__actions">
              <Button variant="outline" size="lg" className="complete__action" onClick={() => setCompleteStep('workshop')}>
                <Wrench size={16} strokeWidth={2} />
                Add to Workshop
              </Button>
              <Button size="lg" className="complete__action" onClick={finishComplete}>
                <CreditCard size={16} strokeWidth={2} />
                Send to POS
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="workshop__head">
              <div className="section-label">Services on this appointment</div>
              <div className="workshop__summary">
                {doneRows} of {totalRows} complete · {totalRows - doneRows} to workshop
              </div>
            </div>

            {totalRows === 0 && (
              <div className="empty-state" style={{ marginTop: 11 }}>
                <div className="empty-state__title">No services recorded</div>
                <div className="empty-state__body">
                  Add services to the equipment before sending work to the workshop.
                </div>
              </div>
            )}

            <div className="workshop__list">
              {groups.map((g) => (
                <div key={g.member.key}>
                  <div className="workshop__group-head">
                    <Avatar initials={g.member.initials} color={detail.type.border} size={26} fontSize={10} />
                    <span className="workshop__group-name">{g.member.name}</span>
                    <Badge variant={g.rows.length > 0 ? 'outline' : 'secondary'}>
                      {g.rows.length === 0
                        ? 'No services'
                        : `${g.rows.length} ${g.rows.length === 1 ? 'service' : 'services'}`}
                    </Badge>
                  </div>
                  {g.rows.length === 0 ? (
                    <div className="workshop__empty">Nothing recorded for this customer.</div>
                  ) : (
                    <div className="workshop__rows">
                      {g.rows.map((r) => (
                        <button
                          className={`workshop__row${r.done ? ' workshop__row--done' : ''}`}
                          type="button"
                          key={r.key}
                          aria-pressed={r.done}
                          onClick={() => toggleSvcDone(r.key)}
                        >
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="workshop__row-title">
                              <span className="workshop__service">{r.service}</span>
                              <span className="workshop__price">{r.price}</span>
                              <Badge variant={r.done ? 'success' : 'warning'}>
                                {r.done ? 'Complete' : 'To workshop'}
                              </Badge>
                            </span>
                            <span className="workshop__meta">
                              <span>
                                Side: <b>{r.side}</b>
                              </span>
                              <span>
                                Location: <b>{r.location}</b>
                              </span>
                              <span>
                                Item: <b>{r.item}</b>
                              </span>
                            </span>
                          </span>
                          <span className={`workshop__tick${r.done ? ' workshop__tick--done' : ''}`}>
                            <Check size={15} strokeWidth={2.6} />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Totals detail={detail} />

            <div className="complete__actions">
              <Button variant="outline" size="lg" onClick={() => setCompleteStep('review')}>
                <ChevronLeft size={15} strokeWidth={2} />
                Back
              </Button>
              <Button size="lg" className="complete__action" onClick={finishComplete}>
                <Wrench size={16} strokeWidth={2} />
                Add to workshop queue and send to POS
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Mark({ on }: { on: boolean }) {
  return (
    <span className={`complete__mark${on ? ' complete__mark--on' : ''}`}>
      {on ? <Check size={13} strokeWidth={3} /> : <Minus size={13} strokeWidth={2.5} />}
    </span>
  );
}

function Totals({ detail }: { detail: DetailInfo }) {
  const { balance, subtotal, paid } = detail.totals;
  return (
    <div className="complete__totals">
      <div style={{ flex: '0 0 auto' }}>
        <div className="totals__label" style={{ fontSize: 10.5 }}>
          Balance due
        </div>
        <div className="complete__balance">{balance}</div>
      </div>
      <dl className="complete__totals-split">
        <div className="complete__totals-line">
          <dt style={{ margin: 0, color: 'var(--n-500)' }}>Subtotal</dt>
          <dd style={{ margin: 0, fontWeight: 600, color: 'var(--n-800)' }}>{subtotal}</dd>
        </div>
        <div className="complete__totals-line">
          <dt style={{ margin: 0, color: 'var(--n-500)' }}>Paid</dt>
          <dd style={{ margin: 0, fontWeight: 600, color: 'var(--success)' }}>{paid}</dd>
        </div>
      </dl>
    </div>
  );
}
