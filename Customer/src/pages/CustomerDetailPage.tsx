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
    status,
    getCustomer,
    updateCustomer,
    getDinRecord,
    loadDinRecord,
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

  // The DIN record is its own resource, fetched the first time it is needed.
  const record = customerId ? getDinRecord(customerId) : undefined;
  const needsDinRecord = Boolean(customerId && customer && !record);
  useEffect(() => {
    if (!customerId || !needsDinRecord) return;
    loadDinRecord(customerId).catch((cause: unknown) => {
      showToast(cause instanceof Error ? cause.message : 'Could not load the DIN record');
    });
  }, [customerId, needsDinRecord, loadDinRecord, showToast]);

  if (!customer || !customerId) {
    if (status === 'loading') {
      return <div className={styles.missing}>Loading customer…</div>;
    }
    return (
      <div className={styles.missing}>
        <p>That customer no longer exists.</p>
        <Link to="/customers">Back to customers</Link>
      </div>
    );
  }

  const calculated = record ? computeDin(record.measurements) : '—';
  const effective = record && record.custom !== null ? formatDin(record.custom) : calculated;

  const report = (cause: unknown, fallback: string) =>
    showToast(cause instanceof Error ? cause.message : fallback);

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

  const save = async () => {
    if (!draft) return;
    try {
      await updateCustomer(customerId, draft);
      setEditing(false);
      setDraft(null);
      showToast('Customer details saved');
    } catch (cause) {
      report(cause, 'Could not save the customer');
    }
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

          {record ? (
            <DinCard
              record={record}
              calculated={calculated}
              effective={effective}
              onMeasurementsChange={(patch) =>
                updateDinMeasurements(customerId, patch).catch((cause: unknown) =>
                  report(cause, 'Could not save the measurements'),
                )
              }
              onCustomChange={(value) =>
                setDinCustom(customerId, value).catch((cause: unknown) =>
                  report(cause, 'Could not save the custom DIN'),
                )
              }
              onSignOff={() => setSignOpen(true)}
              onViewSignature={() => setSignatureOpen(true)}
            />
          ) : (
            <div className={styles.dinPlaceholder}>Loading DIN record…</div>
          )}
        </div>
      </div>

      {signOpen && record && record.custom !== null ? (
        <SignOffDialog
          customValue={record.custom}
          calculated={calculated}
          onClose={() => setSignOpen(false)}
          onConfirm={async (signaturePng) => {
            try {
              await signDin(customerId, signaturePng);
              setSignOpen(false);
              showToast('Custom DIN signed off');
            } catch (cause) {
              report(cause, 'Could not store the signature');
            }
          }}
        />
      ) : null}

      {signatureOpen && record ? (
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
