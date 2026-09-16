import { Check, FileText } from 'lucide-react';
import { reportReady, useScheduler } from '../../store/useScheduler';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DetailInfo } from './useDetail';

/**
 * The customer's PDF summary, as one button.
 *
 * Nothing is worth handing over until both question sets are in for everybody on
 * the booking, so the button is disabled until they are and says why. Making the
 * report explicit rather than a side effect of closing the appointment out means
 * a fitter can produce it, look at it, and still take the money afterwards.
 */
export function ReportCard({ detail }: { detail: DetailInfo }) {
  const id = detail.appt.id;
  const report = useScheduler((s) => s.reports[id]);
  const appts = useScheduler((s) => s.appts);
  const saved = useScheduler((s) => s.saved);
  const createReport = useScheduler((s) => s.createReport);

  const ready = reportReady({ appts, saved }, id);
  const people = detail.party.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>PDF report</CardTitle>
        {report && (
          <CardAction>
            <Badge variant="success">
              <Check size={12} strokeWidth={2.8} />
              Created {report.at}
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        <div className="report__row">
          <span className="report__lede">
            {ready
              ? 'Fitting and equipment summary for the customer.'
              : people > 1
                ? 'Available once the customer questions and staff assessment are complete for everyone on the booking.'
                : 'Available once the customer questions and staff assessment are both complete.'}
          </span>

          <Button
            variant={report ? 'success' : 'default'}
            disabled={!ready}
            title={ready ? undefined : 'Complete the fitting details first'}
            onClick={createReport}
          >
            <FileText size={15} strokeWidth={2} />
            {report ? 'Create again' : 'Create PDF report'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
