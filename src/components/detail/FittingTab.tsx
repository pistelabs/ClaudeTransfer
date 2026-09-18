import { Check } from 'lucide-react';
import { FITTING_QUESTIONS, STAFF_QUESTIONS, staffById } from '../../data/catalogue';
import { fittersOf } from '../../lib/schedule';
import { useScheduler } from '../../store/useScheduler';
import type { Answers, QuestionField } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Field } from '../ui/Field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PartyPills } from './PartyPills';
import type { DetailInfo } from './useDetail';

/**
 * Both question sets, one above the other: what the customer answered, then what
 * the fitter found.
 *
 * They used to share one panel behind a Customer/Staff switch, which meant the
 * fitter could not see the answers they were assessing against without leaving
 * the assessment. Same card, same labelled fields, same completion action for
 * each — and both editable at any point, saved per person on the booking rather
 * than per appointment.
 */
export function FittingTab({ detail }: { detail: DetailInfo }) {
  return (
    <div>
      <PartyPills detail={detail} />
      <QuestionCard detail={detail} side="customer" />
      <QuestionCard detail={detail} side="staff" />
    </div>
  );
}

function QuestionCard({ detail, side }: { detail: DetailInfo; side: 'customer' | 'staff' }) {
  const { appt, custIdx } = detail;
  const records = useScheduler((s) => s.records);
  const saved = useScheduler((s) => s.saved);
  const setCustAnswer = useScheduler((s) => s.setCustAnswer);
  const setStaffAnswer = useScheduler((s) => s.setStaffAnswer);
  const markSaved = useScheduler((s) => s.markSaved);
  const setAssessedBy = useScheduler((s) => s.setAssessedBy);

  const rec = records[appt.id] ?? {};
  const onCustomer = side === 'customer';

  const answers: Answers = onCustomer
    ? (rec.fittingByCustomer?.[custIdx] ?? {})
    : (rec.staffByCustomer?.[custIdx] ?? {});
  const questions = onCustomer ? FITTING_QUESTIONS : STAFF_QUESTIONS;
  const suffix = onCustomer ? `c${custIdx}` : `s${custIdx}`;
  const stamp = saved[`${appt.id}:${suffix}`];

  // With more than one fitter on the booking, the assessment has to say which of
  // them made it — otherwise a shared record has no author.
  const team = fittersOf(appt);
  const assessedBy = rec.assessedBy?.[custIdx] ?? appt.staffId;
  const showAuthor = !onCustomer && team.length > 1;

  return (
    <Card className="detail__panel">
      <CardHeader>
        <CardTitle>{onCustomer ? 'Customer questions' : 'Staff assessment'}</CardTitle>
        <CardDescription>
          {onCustomer
            ? 'Completed by the customer before or during the appointment'
            : 'Recorded by the fitter during the appointment'}
        </CardDescription>
        {stamp && (
          <CardAction>
            <Badge variant="success">
              <Check size={12} strokeWidth={3} />
              Saved {stamp}
              {showAuthor && ` · ${staffById(assessedBy)?.name ?? ''}`}
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        {showAuthor && (
          <div className="assessed-by">
            <Label>Recorded by</Label>
            <div className="assessed-by__options" role="radiogroup" aria-label="Recorded by">
              {team.map((si) => {
                const s = staffById(si);
                if (!s) return null;
                const on = si === assessedBy;
                return (
                  <button
                    className={`assessed-by__option${on ? ' assessed-by__option--on' : ''}`}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    key={si}
                    onClick={() => setAssessedBy(custIdx, si)}
                  >
                    <Avatar initials={s.initials} color={s.dot} size={22} fontSize={9} />
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="answer-grid">
          {questions.map((q: QuestionField) => {
            // Both sets are on the page together now, so a field id has to say
            // which set it belongs to or the labels point at the wrong input.
            const fieldId = `fit-${side}-${custIdx}-${q.id}`;
            return (
              <div className="answer-field" key={q.id}>
                <Label htmlFor={fieldId}>{q.label}</Label>
                <Field
                  field={q}
                  id={fieldId}
                  value={answers[q.id] ?? ''}
                  className="answer-input"
                  onChange={(v) => (onCustomer ? setCustAnswer(custIdx, q.id, v) : setStaffAnswer(custIdx, q.id, v))}
                />
              </div>
            );
          })}
        </div>

        <div className="save-row">
          <Button variant={stamp ? 'success' : 'default'} onClick={() => markSaved(suffix)}>
            <Check size={15} strokeWidth={2.4} />
            {stamp ? 'Completed' : onCustomer ? 'Complete customer questions' : 'Complete assessment'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
