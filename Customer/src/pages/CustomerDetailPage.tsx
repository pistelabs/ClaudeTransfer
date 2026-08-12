import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Calendar, ChevronLeft, Pencil } from 'lucide-react';
import { AppointmentHistoryCard } from '../components/detail/AppointmentHistoryCard';
import { CustomerDetailsCard } from '../components/detail/CustomerDetailsCard';
import { DinCard } from '../components/detail/DinCard';
import { EquipmentCard } from '../components/detail/EquipmentCard';
import { SignOffDialog } from '../components/detail/SignOffDialog';
import { StoredSignatureDialog } from '../components/detail/StoredSignatureDialog';
import { Button } from '../components/ui/Button';
import { computeDin, formatDin } from '../lib/din';
import { downloadDataUrl } from '../lib/download';
import { useCustomers } from '../store/CustomerStore';
import { useToast } from '../store/ToastProvider';
import type { CustomerEdit } from '../types';
import styles from './CustomerDetailPage.module.css';

export function CustomerDetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    getCustomer,
    updateCustomer,
    getDinRecord,
    updateDinMeasurements,
    setDinCustom,
    signDin,
  } = useCustomers();

  const customer = getCustomer(customerId);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CustomerEdit | null>(null);
  const [signOpen, setSignOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);

  // Arriving from the directory should land at the top of the record.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [customerId]);

  if (!customer || !customerId) {
    return (
      <div className={styles.missing}>
        <p>That customer no longer exists.</p>
        <Link to="/customers">Back to customers</Link>
      </div>
    );
  }

  const record = getDinRecord(customerId);
  const calculated = computeDin(record.measurements);
  const effective = record.custom !== null ? formatDin(record.custom) : calculated;

  const startEditing = () => {
    setDraft({
      name: customer.name,
      branch: customer.branch,
      phone: customer.phone,
      email: customer.email,
      preferred: customer.preferred,
    });
    setEditing(true);
  };

  const save = () => {
    if (draft) updateCustomer(customerId, draft);
    setEditing(false);
    setDraft(null);
    showToast('Customer details saved');
  };

  const cancel = () => {
    setEditing(false);
    setDraft(null);
  };

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/customers')}>
        <ChevronLeft size={13} strokeWidth={2.4} aria-hidden="true" />
        Customers
      </button>

      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Customer</div>
          <h1 className={styles.name}>{customer.name}</h1>
          <div className={styles.since}>
            <span className={styles.sinceIcon} aria-hidden="true">
              <Calendar size={13} strokeWidth={2} />
            </span>
            Customer since {customer.memberSince}
          </div>
        </div>
        <Button size="md" onClick={editing ? cancel : startEditing}>
          <Pencil size={14} strokeWidth={2} aria-hidden="true" />
          {editing ? 'Editing…' : 'Edit'}
        </Button>
      </header>

      <div className={styles.grid}>
        <div className={styles.column}>
          <EquipmentCard
            equipment={customer.equipment}
            branch={customer.branch}
            onOpenJob={(jobId, service) => showToast(`Opening service ${jobId} — ${service}`)}
          />
          <AppointmentHistoryCard appointments={customer.appointments} />
        </div>

        <div className={styles.column}>
          <CustomerDetailsCard
            customer={customer}
            editing={editing}
            draft={
              draft ?? {
                name: customer.name,
                branch: customer.branch,
                phone: customer.phone,
                email: customer.email,
                preferred: customer.preferred,
              }
            }
            onDraftChange={(patch) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev))}
            onSave={save}
            onCancel={cancel}
          />

          <DinCard
            record={record}
            calculated={calculated}
            effective={effective}
            onMeasurementsChange={(patch) => updateDinMeasurements(customerId, patch)}
            onCustomChange={(value) => setDinCustom(customerId, value)}
            onSignOff={() => setSignOpen(true)}
            onViewSignature={() => setSignatureOpen(true)}
          />
        </div>
      </div>

      {signOpen && record.custom !== null ? (
        <SignOffDialog
          customValue={record.custom}
          calculated={calculated}
          onClose={() => setSignOpen(false)}
          onConfirm={(signatureUrl, signedAt) => {
            signDin(customerId, signedAt, signatureUrl);
            setSignOpen(false);
            showToast('Custom DIN signed off');
          }}
        />
      ) : null}

      {signatureOpen ? (
        <StoredSignatureDialog
          filename={`signature-${customerId}-din.png`}
          signatureUrl={record.signatureUrl}
          signedAt={record.signedAt}
          dinValue={record.custom}
          onClose={() => setSignatureOpen(false)}
          onDownload={() => {
            downloadDataUrl(record.signatureUrl, `signature-${customerId}-din.png`);
            showToast('Signature downloaded');
          }}
        />
      ) : null}
    </div>
  );
}
