import { useState } from 'react';
import { ArrowRight, Eye, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { CheckboxTile } from '../ui/Checkbox';
import { Field, Input, Select } from '../ui/Field';
import { SKIER_ABILITIES } from '../../lib/din';
import type { DinMeasurements, DinRecord, SkierAbility } from '../../types';
import styles from './DinCard.module.css';

interface DinCardProps {
  record: DinRecord;
  /** The value the measurements produce, regardless of any override. */
  calculated: string;
  /** What the customer's binding is actually set to — override or calculated. */
  effective: string;
  onMeasurementsChange: (patch: Partial<DinMeasurements>) => void;
  onCustomChange: (value: number | string | null) => void;
  onSignOff: () => void;
  onViewSignature: () => void;
}

/**
 * Flip card: the DIN value on the front, the calculator on the back. One face
 * is mounted at a time so each entrance replays the flip animation.
 */
export function DinCard(props: DinCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={styles.perspective}>
      {flipped ? (
        <DinCalculator {...props} onBack={() => setFlipped(false)} />
      ) : (
        <DinFace record={props.record} value={props.effective} onFlip={() => setFlipped(true)} />
      )}
    </div>
  );
}

function DinFace({
  record,
  value,
  onFlip,
}: {
  record: DinRecord;
  value: string;
  onFlip: () => void;
}) {
  return (
    <button type="button" className={styles.front} onClick={onFlip}>
      <div className={styles.frontHeader}>
        <span className={styles.frontLabel}>DIN setting</span>
        <span className={styles.refreshIcon} aria-hidden="true">
          <RotateCcw size={15} strokeWidth={2} />
        </span>
      </div>

      <div className={styles.frontBody}>
        <div className={styles.value}>{value}</div>
        <div className={styles.caption}>
          {record.custom !== null ? 'Custom override' : 'Binding release value'}
        </div>
        {record.signedAt ? (
          <div className={styles.stamp}>
            <span className={styles.stampLabel}>Signed</span>
            <span className={styles.stampTime}>{record.signedAt}</span>
          </div>
        ) : null}
      </div>

      <div className={styles.frontFooter}>
        Tap to adjust
        <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
      </div>
    </button>
  );
}

function DinCalculator({
  record,
  calculated,
  onMeasurementsChange,
  onCustomChange,
  onSignOff,
  onViewSignature,
  onBack,
}: DinCardProps & { onBack: () => void }) {
  const { measurements, custom, signedAt, signatureUrl } = record;
  const isCustom = custom !== null;

  return (
    <div className={styles.back}>
      <div className={styles.backHeader}>
        <h2 className={styles.backTitle}>DIN calculator</h2>
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
          <RotateCcw size={13} strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>

      <div className={styles.customToggle}>
        <CheckboxTile
          label="Set a custom DIN"
          checked={isCustom}
          // Seeds the override with the calculated value; unchecking restores it.
          onChange={(checked) => onCustomChange(checked ? calculated : null)}
        />
      </div>

      {isCustom ? (
        <div className={styles.override}>
          <Field label="Custom DIN value" labelStyle="tiny">
            {(id) => (
              <Input
                id={id}
                type="number"
                step="0.5"
                controlSize="value"
                value={custom}
                onChange={(event) => onCustomChange(event.target.value)}
              />
            )}
          </Field>
          <div className={styles.overrideNote}>
            Overrides the calculated value of {calculated}
          </div>

          {signedAt ? (
            <div className={styles.signed}>
              <div
                className={styles.signature}
                style={{ backgroundImage: signatureUrl ? `url("${signatureUrl}")` : undefined }}
                role="img"
                aria-label="Captured signature"
              />
              <div className={styles.signedText}>
                <div className={styles.signedTitle}>Signed off</div>
                <div className={styles.signedTime}>{signedAt}</div>
              </div>
              <Button
                variant="success"
                size="xs"
                className={styles.viewButton}
                onClick={onViewSignature}
              >
                <Eye size={12} strokeWidth={2} aria-hidden="true" />
                View
              </Button>
            </div>
          ) : (
            <Button variant="primary" fullWidth className={styles.signOff} onClick={onSignOff}>
              Sign off this DIN
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.measurements}>
            <Field label="Height (cm)" labelStyle="tiny">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  controlSize="xs"
                  value={measurements.height}
                  onChange={(event) => onMeasurementsChange({ height: event.target.value })}
                />
              )}
            </Field>
            <Field label="Weight (kg)" labelStyle="tiny">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  controlSize="xs"
                  value={measurements.weight}
                  onChange={(event) => onMeasurementsChange({ weight: event.target.value })}
                />
              )}
            </Field>
            <Field label="Age" labelStyle="tiny">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  controlSize="xs"
                  value={measurements.age}
                  onChange={(event) => onMeasurementsChange({ age: event.target.value })}
                />
              )}
            </Field>
            <Field label="Boot sole (mm)" labelStyle="tiny">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  controlSize="xs"
                  value={measurements.bsl}
                  onChange={(event) => onMeasurementsChange({ bsl: event.target.value })}
                />
              )}
            </Field>
          </div>

          <Field label="Skier ability" labelStyle="tiny" className={styles.ability}>
            {(id) => (
              <Select
                id={id}
                controlSize="xs"
                options={SKIER_ABILITIES}
                value={measurements.ability}
                onChange={(event) =>
                  onMeasurementsChange({ ability: event.target.value as SkierAbility })
                }
              />
            )}
          </Field>

          <div className={styles.calculated}>
            <span className={styles.calculatedLabel}>Calculated DIN</span>
            <span className={styles.calculatedValue}>{calculated}</span>
          </div>
        </>
      )}
    </div>
  );
}
