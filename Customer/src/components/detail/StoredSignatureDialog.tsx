import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogFooter, DialogHeader, useDialogTitleId } from '../ui/Dialog';
import { formatDin } from '../../lib/din';
import { dataUrlSizeKb } from '../../lib/format';
import styles from './StoredSignatureDialog.module.css';

interface StoredSignatureDialogProps {
  /** Filename the record is stored under, e.g. `signature-c1-din.png`. */
  filename: string;
  signatureUrl: string;
  signedAt: string;
  dinValue: number | string | null;
  onClose: () => void;
  onDownload: () => void;
}

/** Shows the signature as it would come back from storage. */
export function StoredSignatureDialog({
  filename,
  signatureUrl,
  signedAt,
  dinValue,
  onClose,
  onDownload,
}: StoredSignatureDialogProps) {
  const titleId = useDialogTitleId();

  return (
    <Dialog
      onClose={onClose}
      maxWidth={440}
      variant="sectioned"
      align="center"
      blurred
      zIndex={58}
      labelledBy={titleId}
    >
      <DialogHeader
        id={titleId}
        title="Stored signature"
        description={filename}
        onClose={onClose}
        size="sm"
        closePlacement="inline"
      />

      <div
        className={styles.preview}
        style={{ backgroundImage: signatureUrl ? `url("${signatureUrl}")` : undefined }}
        role="img"
        aria-label="Stored signature"
      />

      <dl className={styles.meta}>
        <div className={styles.row}>
          <dt className={styles.label}>Signed</dt>
          <dd className={styles.value}>{signedAt}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.label}>DIN value</dt>
          <dd className={styles.value}>{formatDin(dinValue)}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.label}>Format</dt>
          <dd className={styles.value}>PNG · {dataUrlSizeKb(signatureUrl)}</dd>
        </div>
      </dl>

      <DialogFooter>
        <Button size="md" onClick={onDownload}>
          <Download size={14} strokeWidth={2} aria-hidden="true" />
          Download
        </Button>
        <Button size="md" variant="primary" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
