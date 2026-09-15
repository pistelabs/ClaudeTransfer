import { useMemo } from 'react';
import { Check, FileText, Minus } from 'lucide-react';
import { staffById } from '../../data/catalogue';
import { buildReport, useScheduler } from '../../store/useScheduler';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApptReport } from '../../types';
import type { DetailInfo } from './useDetail';

/**
 * The customer's summary of the appointment.
 *
 * Sits here rather than in the complete dialog because it belongs to the booking,
 * not to the act of closing it: staff want to see what will go out, and after the
 * fact what did. Before completion it previews what has been captured so far, so
 * a gap is visible while there is still time to fill it. Completing takes the
 * snapshot, and from then on the card shows that instead.
 */
export function ReportCard({ detail }: { detail: DetailInfo }) {
  const report = useScheduler((s) => s.reports[detail.appt.id]);

  // The preview is derived, so it is built from the slices it reads rather than
  // inside a selector — a selector returning a fresh object every render never
  // compares equal, and Zustand would re-render on a loop.
  const appts = useScheduler((s) => s.appts);
  const saved = useScheduler((s) => s.saved);
  const equipment = useScheduler((s) => s.equipment);
  const bookedBy = useScheduler((s) => s.bookedBy);
  const id = detail.appt.id;
  const preview = useMemo(
    () => (report ? null : buildReport({ appts, saved, equipment, bookedBy }, id)),
    [report, appts, saved, equipment, bookedBy, id],
  );

  const shown: ApptReport | null = report ?? preview;
  if (!shown) return null;

  const taker = report?.by ? staffById(report.by) : null;
  const captured = shown.people.filter((p) => p.fitting || p.assessment || p.equipment.length).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer report</CardTitle>
        <CardAction>
          {report ? (
            <Badge variant="success">
              <Check size={12} strokeWidth={2.8} />
              Created {report.at}
            </Badge>
          ) : (
            <Badge variant="secondary">Not created yet</Badge>
          )}
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="report__lede">
          <FileText size={15} strokeWidth={2} color="var(--n-400)" />
          {report ? (
            <span>
              Fitting and equipment summary, taken when the appointment was completed
              {taker ? ` by ${taker.name}` : ''}.
            </span>
          ) : (
            <span>
              Fitting and equipment summary for the customer. It is taken when the appointment is
              completed — {captured} of {shown.people.length}{' '}
              {shown.people.length === 1 ? 'person has' : 'people have'} anything recorded so far.
            </span>
          )}
        </div>

        <div className="report__people">
          {shown.people.map((p) => (
            <div className="report__person" key={p.name}>
              <div className="report__person-head">
                <span className="report__name">{p.name}</span>
                <span className="report__marks">
                  <Mark on={p.fitting} label="Fitting" />
                  <Mark on={p.assessment} label="Assessment" />
                </span>
              </div>

              {p.equipment.length === 0 ? (
                <div className="report__empty">No equipment recorded</div>
              ) : (
                <ul className="report__items">
                  {p.equipment.map((e) => (
                    <li className="report__item" key={e.item}>
                      <span className="report__item-name">{e.item}</span>
                      <span className="report__item-svcs">
                        {e.services.length ? e.services.join(', ') : 'No work recorded'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** A captured / not-captured mark, named so it reads without the colour. */
function Mark({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`report__mark${on ? ' report__mark--on' : ''}`}>
      {on ? <Check size={11} strokeWidth={3} /> : <Minus size={11} strokeWidth={2.5} />}
      {label}
    </span>
  );
}
