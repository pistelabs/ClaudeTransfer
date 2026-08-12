import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddCustomerDialog } from '../components/directory/AddCustomerDialog';
import { CustomerTable } from '../components/directory/CustomerTable';
import { DirectoryToolbar } from '../components/directory/DirectoryToolbar';
import { ExportDialog } from '../components/directory/ExportDialog';
import { Button } from '../components/ui/Button';
import type { ExportScope } from '../components/directory/ExportDialog';
import { buildCsv } from '../lib/csv';
import type { ExportFieldKey } from '../lib/csv';
import { downloadText } from '../lib/download';
import { filterCustomers } from '../lib/filters';
import type { CustomerFilter } from '../lib/filters';
import { pluralize } from '../lib/format';
import { useCustomers } from '../store/CustomerStore';
import { useToast } from '../store/ToastProvider';
import type { NewCustomerInput } from '../types';
import styles from './DirectoryPage.module.css';

export function DirectoryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { customers, status, error, reload, addCustomer } = useCustomers();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CustomerFilter>('All Customers');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const visible = useMemo(
    () => filterCustomers(customers, filter, search),
    [customers, filter, search],
  );
  const selectedCount = Object.values(selected).filter(Boolean).length;

  // "Select all" covers the current result set, not the whole directory.
  const toggleAll = (checked: boolean) =>
    setSelected((prev) => {
      const next = { ...prev };
      for (const customer of visible) next[customer.id] = checked;
      return next;
    });

  const handleAdd = async (input: NewCustomerInput) => {
    try {
      const customer = await addCustomer(input);
      setAddOpen(false);
      showToast(`${customer.name} added`);
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Could not add the customer');
    }
  };

  const handleExport = (scope: ExportScope, fields: Record<ExportFieldKey, boolean>) => {
    const data = scope === 'selected' ? customers.filter((c) => selected[c.id]) : customers;
    if (data.length === 0) {
      showToast('No customers selected');
      return;
    }
    if (!Object.values(fields).some(Boolean)) {
      showToast('Select at least one field');
      return;
    }

    downloadText(buildCsv(data, fields), 'customers.csv', 'text/csv');
    setExportOpen(false);
    showToast(`Exported ${pluralize(data.length, 'customer')} to CSV`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.count}>
            {pluralize(customers.length, 'customer')} · {visible.length} shown
          </p>
        </div>
      </header>

      <DirectoryToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        onExport={() => setExportOpen(true)}
        onAdd={() => setAddOpen(true)}
      />

      {status === 'loading' ? (
        <div className={styles.state}>Loading customers…</div>
      ) : status === 'error' ? (
        <div className={styles.state}>
          <p className={styles.stateText}>{error ?? 'Could not load customers.'}</p>
          <Button onClick={reload}>Try again</Button>
        </div>
      ) : (
        <CustomerTable
          customers={visible}
          selected={selected}
          onToggleAll={toggleAll}
          onToggleOne={(id, checked) => setSelected((prev) => ({ ...prev, [id]: checked }))}
          onOpen={(id) => navigate(`/customers/${id}`)}
        />
      )}

      {addOpen ? (
        <AddCustomerDialog onClose={() => setAddOpen(false)} onSubmit={handleAdd} />
      ) : null}

      {exportOpen ? (
        <ExportDialog
          totalCount={customers.length}
          selectedCount={selectedCount}
          onClose={() => setExportOpen(false)}
          onExport={handleExport}
        />
      ) : null}
    </div>
  );
}
