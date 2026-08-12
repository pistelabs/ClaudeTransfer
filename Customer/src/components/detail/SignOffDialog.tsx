import { useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog, DialogFooter, DialogHeader, useDialogTitleId } from '../ui/Dialog';
import { SignaturePad } from './SignaturePad';
import type { SignaturePadHandle } from './SignaturePad';
import { formatDin } from '../../lib/din';
import { timestamp } from '../../lib/format';
import styles from './SignOffDialog.module.css';

interface SignOffDialogProps {
  customValue: number | string;
  calculated: string;
  onClose: () => void;
  /** Receives the captured signature as a PNG data URL. */
  onConfirm: (signaturePng: string) => void;
}

export function SignOffDialog({
  customValue,
  calculated,
  onClose,
  onConfirm,
}: SignOffDialogProps) {
  const titleId = useDialogTitleId();
  const pad = useRef<SignaturePadHandle>(null);
  const [empty, setEmpty] = useState(true);
  // Preview only — the server stamps the signature when it is stored.
  const [openedAt] = useState(() => timestamp());

  const confirm = () => {
    if (empty) return;
    onConfirm(pad.current?.toDataUrl() ?? '');
  };

  return (
    <Dialog onClose={onClose} maxWidth={460} align="center" zIndex={55} labelledBy={titleId}>
      <DialogHeader
        id={titleId}
        title="Sign off custom DIN"
        description="This override replaces the calculated release value."
        onClose={onClose}
      />

      <div className={styles.values}>
        <div>
          <div className={styles.valueLabel}>Custom DIN</div>
          <div className={styles.custom}>{formatDin(customValue)}</div>
        </div>
        <div>
          <div className={styles.valueLabel}>Calculated</div>
          <div className={styles.calculated}>{calculated}</div>
        </div>
      </div>

      <div className={styles.signature}>
        <div className={styles.signatureHeader}>
          <div className={styles.signatureLabel}>Signature</div>
          <Button
            variant="ghost"
            size="sm"
            className={styles.clear}
            onClick={() => {
              pad.current?.clear();
              setEmpty(true);
            }}
          >
            Clear
          </Button>
        </div>
        <SignaturePad ref={pad} empty={empty} onDraw={() => setEmpty(false)} />
        <div className={styles.timestamp}>Timestamp {openedAt}</div>
      </div>

      <DialogFooter>
        <Button size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button size="lg" variant="primary" disabled={empty} onClick={confirm}>
          Confirm signature
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
