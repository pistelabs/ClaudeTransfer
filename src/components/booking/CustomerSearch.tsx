import { Plus, Search, X } from 'lucide-react';
import { initialsOf } from '../../lib/dates';
import { useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';

const MIN_QUERY = 2;
const MAX_RESULTS = 5;
const CUSTOMER_COLOR = '#db2777';

export function CustomerSearch() {
  const custQuery = useScheduler((s) => s.custQuery);
  const custPicked = useScheduler((s) => s.custPicked);
  const custFocus = useScheduler((s) => s.custFocus);
  const customers = useScheduler((s) => s.customers);
  const setCustQuery = useScheduler((s) => s.setCustQuery);
  const setCustFocus = useScheduler((s) => s.setCustFocus);
  const pickCustomer = useScheduler((s) => s.pickCustomer);
  const clearCustomer = useScheduler((s) => s.clearCustomer);
  const openNewCust = useScheduler((s) => s.openNewCust);

  const picked = customers.find((c) => c.id === custPicked) ?? null;
  const q = custQuery.trim().toLowerCase();
  const dropOpen = custFocus && q.length >= MIN_QUERY && !picked;
  const results = dropOpen
    ? customers
        .filter((c) => `${c.first} ${c.last} ${c.email} ${c.phone}`.toLowerCase().includes(q))
        .slice(0, MAX_RESULTS)
    : [];

  return (
    <div>
      <div className="cust-search">
        <Search className="cust-search__icon" size={16} strokeWidth={2} aria-hidden />
        <input
          className="cust-search__input"
          value={custQuery}
          placeholder={`Search existing customer (min ${MIN_QUERY} characters)…`}
          aria-label="Search existing customer"
          onChange={(e) => setCustQuery(e.target.value)}
          onFocus={() => setCustFocus(true)}
        />
      </div>

      {picked && (
        <div className="cust-picked">
          <Avatar initials={initialsOf(`${picked.first} ${picked.last}`)} color={CUSTOMER_COLOR} size={34} fontSize={12} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="cust-picked__name">
              {picked.first} {picked.last}
            </div>
            <div className="cust-picked__meta">
              {picked.email}&nbsp; · &nbsp;{picked.phone}
            </div>
          </div>
          <span className="cust-picked__visits">
            {picked.visits === 1 ? '1 visit' : `${picked.visits} visits`}
          </span>
          <button className="cust-picked__clear" type="button" title="Clear" onClick={clearCustomer}>
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      )}

      {dropOpen && (
        <div className="cust-drop">
          {results.map((c) => (
            <button className="cust-drop__row" type="button" key={c.id} onClick={() => pickCustomer(c)}>
              <Avatar initials={initialsOf(`${c.first} ${c.last}`)} color={CUSTOMER_COLOR} size={34} fontSize={12} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="cust-drop__name">
                  {c.first} {c.last}
                </span>
                <span className="cust-drop__meta">
                  {c.email}&nbsp; · &nbsp;{c.phone}
                </span>
              </span>
              <span className="cust-drop__visits">{c.visits === 1 ? '1 visit' : `${c.visits} visits`}</span>
            </button>
          ))}
          {results.length === 0 && <div className="cust-drop__empty">No matching customer</div>}
          <button className="cust-drop__add" type="button" onClick={openNewCust}>
            <Plus size={16} strokeWidth={2.2} />
            Add new customer
          </button>
        </div>
      )}
    </div>
  );
}
