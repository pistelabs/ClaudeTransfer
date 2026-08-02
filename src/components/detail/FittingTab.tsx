import { Check } from 'lucide-react';
import { FITTING_QUESTIONS, STAFF_QUESTIONS } from '../../data/catalogue';
import { useScheduler } from '../../store/useScheduler';
import type { Answers, QuestionField } from '../../types';
import { Field } from '../ui/Field';
import { Badge, Button, Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle, Label } from '../ui/primitives';
import { PartyPills } from './PartyPills';
import type { DetailInfo } from './useDetail';

/**
 * Two backend-defined question sets rendered identically. Customer questions can
 * be filled before or during the appointment; the staff assessment only unlocks
 * once that person is checked in. Both are saved per person, not per booking.
 */
export function FittingTab({ detail }: { detail: DetailInfo }) {
  const { appt, party, custIdx } = detail;
  const who = useScheduler((s) => s.detailWho);
  const setWho = useScheduler((s) => s.setDetailWho);
  const records = useScheduler((s) => s.records);
  const saved = useScheduler((s) => s.saved);
  const checkins = useScheduler((s) => s.checkins);
  const setCustAnswer = useScheduler((s) => s.setCustAnswer);
  const setStaffAnswer = useScheduler((s) => s.setStaffAnswer);
  const markSaved = useScheduler((s) => s.markSaved);

  const rec = records[appt.id] ?? {};
  const checkedIn = !!checkins[party[custIdx].key];
  const onCustomer = who === 'customer';

  const answers: Answers = onCustomer
    ? (rec.fittingByCustomer?.[custIdx] ?? {})
    : (rec.staffByCustomer?.[custIdx] ?? {});
  const questions = onCustomer ? FITTING_QUESTIONS : STAFF_QUESTIONS;
  const suffix = onCustomer ? `c${custIdx}` : `s${custIdx}`;
  const stamp = saved[`${appt.id}:${suffix}`];

  const hasAnswers = questions.some((q) => (answers[q.id] ?? '').trim());
  // Staff measurements are captured at the bench; before check-in they are read-only.
  const editable = onCustomer || checkedIn;

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
              </Badge>
            </CardAction>
          )}
        </CardHeader>

        <CardContent>
          {!editable && !hasAnswers ? (
            <div className="empty-state">
              <div className="empty-state__title">Check in to start the assessment</div>
              <div className="empty-state__body">
                These measurements unlock once the customer is checked in at the bench.
              </div>
            </div>
          ) : (
            <>
              <div className="answer-grid">
                {questions.map((q: QuestionField) => {
                  const value = answers[q.id] ?? '';
                  if (!editable) {
                    return (
                      <div className="answer-readonly" key={q.id}>
                        <div className="answer-label">{q.label}</div>
                        <div className={`answer-readonly__value${value ? '' : ' answer-readonly__value--empty'}`}>
                          {value || 'Not recorded'}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="answer-field" key={q.id}>
                      <Label htmlFor={`fit-${q.id}`}>{q.label}</Label>
                      <Field
                        field={q}
                        value={value}
                        className="answer-input"
                        onChange={(v) =>
                          onCustomer ? setCustAnswer(custIdx, q.id, v) : setStaffAnswer(custIdx, q.id, v)
                        }
                      />
                    </div>
                  );
                })}
              </div>

              {editable && (
                <div className="save-row">
                  <Button variant={stamp ? 'success' : 'default'} onClick={() => markSaved(suffix)}>
                    <Check size={15} strokeWidth={2.4} />
                    {stamp ? 'Completed' : onCustomer ? 'Complete customer questions' : 'Complete assessment'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
