import { Check } from 'lucide-react';
import { FITTING_QUESTIONS, STAFF, STAFF_QUESTIONS } from '../../data/catalogue';
import { fittersOf } from '../../lib/schedule';
import { useScheduler } from '../../store/useScheduler';
import type { Answers, QuestionField } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Field } from '../ui/Field';
import { Badge, Button, Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle, Label } from '../ui/primitives';
import { PartyPills } from './PartyPills';
import type { DetailInfo } from './useDetail';

/**
 * Two backend-defined question sets rendered identically — same card, same
 * labelled fields, same completion action. Both are editable at any point and
 * saved per person on the booking, not per appointment.
 */
export function FittingTab({ detail }: { detail: DetailInfo }) {
  const { appt, custIdx } = detail;
  const who = useScheduler((s) => s.detailWho);
  const setWho = useScheduler((s) => s.setDetailWho);
  const records = useScheduler((s) => s.records);
  const saved = useScheduler((s) => s.saved);
  const setCustAnswer = useScheduler((s) => s.setCustAnswer);
  const setStaffAnswer = useScheduler((s) => s.setStaffAnswer);
  const markSaved = useScheduler((s) => s.markSaved);
  const setAssessedBy = useScheduler((s) => s.setAssessedBy);

  const rec = records[appt.id] ?? {};
  const onCustomer = who === 'customer';

  const answers: Answers = onCustomer
    ? (rec.fittingByCustomer?.[custIdx] ?? {})
    : (rec.staffByCustomer?.[custIdx] ?? {});
  const questions = onCustomer ? FITTING_QUESTIONS : STAFF_QUESTIONS;
  const suffix = onCustomer ? `c${custIdx}` : `s${custIdx}`;
  const stamp = saved[`${appt.id}:${suffix}`];

  // With more than one fitter on the booking, the assessment has to say which of
  // them made it — otherwise a shared record has no author.
  const team = fittersOf(appt);
  const assessedBy = rec.assessedBy?.[custIdx] ?? appt.s;
  const showAuthor = !onCustomer && team.length > 1;

  return (
    <div>
      <PartyPills detail={detail} />

      <div className="who-strip" role="tablist">
        <button
          className={`who-strip__btn${onCustomer ? ' who-strip__btn--on' : ''}`}
          type="button"
          role="tab"
          aria-selected={onCustomer}
          onClick={() => setWho('customer')}
        >
          Customer
        </button>
        <button
          className={`who-strip__btn${onCustomer ? '' : ' who-strip__btn--on'}`}
          type="button"
          role="tab"
          aria-selected={!onCustomer}
          onClick={() => setWho('staff')}
        >
          Staff
        </button>
      </div>

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
                {showAuthor && ` · ${STAFF[assessedBy].name}`}
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
                  const s = STAFF[si];
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
            {questions.map((q: QuestionField) => (
              <div className="answer-field" key={q.id}>
                <Label htmlFor={`fit-${q.id}`}>{q.label}</Label>
                <Field
                  field={q}
                  value={answers[q.id] ?? ''}
                  className="answer-input"
                  onChange={(v) => (onCustomer ? setCustAnswer(custIdx, q.id, v) : setStaffAnswer(custIdx, q.id, v))}
                />
              </div>
            ))}
          </div>

          <div className="save-row">
            <Button variant={stamp ? 'success' : 'default'} onClick={() => markSaved(suffix)}>
              <Check size={15} strokeWidth={2.4} />
              {stamp ? 'Completed' : onCustomer ? 'Complete customer questions' : 'Complete assessment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
