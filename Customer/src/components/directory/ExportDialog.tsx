import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Dialog, DialogFooter, DialogHeader, useDialogTitleId } from '../ui/Dialog';
import { DEFAULT_EXPORT_FIELDS, EXPORT_FIELDS } from '../../lib/csv';
import type { ExportFieldKey } from '../../lib/csv';
import styles from './ExportDialog.module.css';

export type ExportScope = 'all' | 'selected';

interface ExportDialogProps {
  totalCount: number;
  selectedCount: number;
  onClose: () => void;
  onExport: (scope: ExportScope, fields: Record<ExportFieldKey, boolean>) => void;
}

export function ExportDialog({
  totalCount,
  selectedCount,
  onClose,
  onExport,
}: ExportDialogProps) {
  const titleId = useDialogTitleId();
  const [scope, setScope] = useState<ExportScope>('all');
  const [fields, setFields] = useState<Record<ExportFieldKey, boolean>>(DEFAULT_EXPORT_FIELDS);

  const toggleField = (key: ExportFieldKey) =>
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Dialog
      onClose={onClose}
      maxWidth={460}
      variant="sectioned"
      blurred
      labelledBy={titleId}
    >
      <DialogHeader
        id={titleId}
        title="Export to CSV"
        description="Choose which customers and fields to include."
        onClose={onClose}
        size="md"
        closePlacement="inline"
      />

      <div className={styles.body}>
        <div className={styles.sectionLabel}>Customers to export</div>
        <div className={styles.scope} role="group" aria-label="Customers to export">
          <Button
            className={styles.scopeButton}
            variant={scope === 'all' ? 'primary' : 'secondary'}
            aria-pressed={scope === 'all'}
            onClick={() => setScope('all')}
          >
            All ({totalCount})
          </Button>
          <Button
            className={styles.scopeButton}
            variant={scope === 'selected' ? 'primary' : 'secondary'}
            aria-pressed={scope === 'selected'}
            onClick={() => setScope('selected')}
          >
            Selected ({selectedCount})
          </Button>
        </div>

        <div className={styles.sectionLabel}>Fields</div>
        <div className={styles.fields}>
          {EXPORT_FIELDS.map((field) => (
            <label key={field.key} className={styles.fieldRow}>
              <Checkbox checked={fields[field.key]} onChange={() => toggleField(field.key)} />
              {field.label}
            </label>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => onExport(scope, fields)}>
          <Download size={15} strokeWidth={2} aria-hidden="true" />
          Export
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
