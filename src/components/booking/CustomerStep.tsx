import { Check, Clock, Mail, SquarePen } from 'lucide-react';
import { FITTING_QUESTIONS, requiredFields, serviceById } from '../../data/catalogue';
import {
  seatAt,
  seatCountOf,
  seatMissing,
  useScheduler,
  type SchedulerStore,
} from '../../store/useScheduler';
import type { QuestionnaireMode } from '../../types';
import { Field } from '../ui/Field';
import { CustomerSearch } from './CustomerSearch';

const QUESTIONNAIRE_OPTIONS: { k: QuestionnaireMode; label: string; sub: string }[] = [
  { k: 'now', label: 'Fill in now', sub: 'Complete the questions with the customer here' },
  { k: 'email', label: 'Send via email', sub: 'Email a link for them to complete before arrival' },
  { k: 'onsite', label: 'Fill in during appointment', sub: 'The fitter captures answers at the bench' },
];

const QUESTIONNAIRE_ICON = { now: SquarePen, email: Mail, onsite: Clock } as const;

export function CustomerStep() {
  const type = useScheduler((s) => s.form.type);
  const service = useScheduler((s) => s.form.service);
  const note = useScheduler((s) => s.form.note);
  const details = useScheduler((s) => s.details);
  const fitting = useScheduler((s) => s.fitting);
  const questionnaire = useScheduler((s) => s.questionnaire);
  const setNote = useScheduler((s) => s.setNote);
  const setDetailField = useScheduler((s) => s.setDetailField);
  const setFittingField = useScheduler((s) => s.setFittingField);
  const setQuestionnaire = useScheduler((s) => s.setQuestionnaire);

  const svc = serviceById(service);
  const fields = requiredFields(type);
  const answered = Object.values(fitting).filter((v) => v.trim()).length;

  return (
    <>
      <SeatSelector />
      <CustomerSearch />

      <div>
        <div className="section-label">Information required at booking</div>
        <div className="section-sub">
          {svc ? `Information required for ${svc.name}` : 'Information required at booking'}
        </div>
        <div className="field-grid">
          {fields.map((f) => (
            <div key={f.id}>
              <label className="field-label" htmlFor={`req-${f.id}`}>
                {f.label} {f.req ? '*' : ''}
              </label>
              <Field field={{ ...f }} value={details[f.id] ?? ''} onChange={(v) => setDetailField(f.id, v)} />
            </div>
          ))}
        </div>

        <div className="section-label" style={{ marginTop: 24 }}>
          Notes
        </div>
        <textarea
          className="textarea-input"
          style={{ marginTop: 11 }}
          rows={3}
          value={note}
          placeholder="Anything else the fitter should know…"
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="section-label" style={{ marginTop: 24 }}>
          Customer fitting questions
        </div>
        <div className="section-sub">How should the customer&rsquo;s fitting questionnaire be completed?</div>
        <div className="q-options">
          {QUESTIONNAIRE_OPTIONS.map((o) => {
            const Icon = QUESTIONNAIRE_ICON[o.k];
            const on = questionnaire === o.k;
            return (
              <button
                className={`q-option${on ? ' q-option--on' : ''}`}
                type="button"
                aria-pressed={on}
                key={o.k}
                onClick={() => setQuestionnaire(o.k)}
              >
                <span className="q-option__icon">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className="q-option__label">{o.label}</span>
                <span className="q-option__sub">{o.sub}</span>
              </button>
            );
          })}
        </div>

        {questionnaire === 'now' && (
          <div className="questionnaire-inline">
            <div className="questionnaire-inline__head">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--n-800)' }}>Fitting questionnaire</div>
              <div style={{ fontSize: 11.5, color: 'var(--n-350)' }}>
                {answered} of {FITTING_QUESTIONS.length} answered
              </div>
            </div>
            <div className="field-grid" style={{ marginTop: 14 }}>
              {FITTING_QUESTIONS.map((f) => (
                <div key={f.id}>
                  <label className="field-label">{f.label}</label>
                  <Field field={f} value={fitting[f.id] ?? ''} onChange={(v) => setFittingField(f.id, v)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Multi-person services (e.g. Couples Boot Fitting) keep a customer *and* their
 * own required-at-booking answers per seat. Single-seat services show nothing.
 */
function SeatSelector() {
  const seatIdx = useScheduler((s) => s.seatIdx);
  const switchSeat = useScheduler((s) => s.switchSeat);
  // seat state is spread across form/details/seatData, so read the whole store here
  const store = useScheduler((s) => s as SchedulerStore);

  const count = seatCountOf(store);
  if (count <= 1) return null;

  return (
    <div style={{ marginBottom: -2 }}>
      <div className="section-label" style={{ marginBottom: 9 }}>
        This booking takes more than one customer
      </div>
      <div className="seats">
        {Array.from({ length: count }, (_, i) => {
          const seat = seatAt(store, i);
          const done = seatMissing(store, i) === 0;
          const on = i === seatIdx;
          return (
            <button
              className={`seat${on ? ' seat--on' : ''}`}
              type="button"
              key={i}
              aria-pressed={on}
              onClick={() => switchSeat(i)}
            >
              <span className={`seat__dot${done ? ' seat__dot--done' : on ? ' seat__dot--on' : ''}`}>
                {done ? <Check size={12} strokeWidth={3.2} /> : i + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="seat__label">Customer {i + 1}</span>
                <span className="seat__name">{seat.customer.trim() || 'Not set'}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
