import { Download, Search, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Field';
import { CUSTOMER_FILTERS } from '../../lib/filters';
import type { CustomerFilter } from '../../lib/filters';
import styles from './DirectoryToolbar.module.css';

interface DirectoryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: CustomerFilter;
  onFilterChange: (value: CustomerFilter) => void;
  onExport: () => void;
  onAdd: () => void;
}

export function DirectoryToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onExport,
  onAdd,
}: DirectoryToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <Search size={15} strokeWidth={2} />
          </span>
          <Input
            controlSize="md"
            className={styles.searchInput}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Find a customer"
            aria-label="Find a customer"
          />
        </div>
        <Select
          controlSize="md"
          customChevron
          options={CUSTOMER_FILTERS}
          value={filter}
          onChange={(event) => onFilterChange(event.target.value as CustomerFilter)}
          aria-label="Filter customers"
        />
      </div>
      <div className={styles.actions}>
        <Button onClick={onExport}>
          <Download size={15} strokeWidth={2} aria-hidden="true" />
          Export to CSV
        </Button>
        <Button variant="primary" onClick={onAdd}>
          <UserPlus size={15} strokeWidth={2} aria-hidden="true" />
          Add a customer
        </Button>
      </div>
    </div>
  );
}
