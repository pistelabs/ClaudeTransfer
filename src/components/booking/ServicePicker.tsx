import { SERVICE_GROUPS, TYPES } from '../../data/catalogue';
import { durationLabel } from '../../lib/time';
import { useScheduler } from '../../store/useScheduler';

export function ServicePicker() {
  const svcTab = useScheduler((s) => s.svcTab);
  const selected = useScheduler((s) => s.form.service);
  const setSvcTab = useScheduler((s) => s.setSvcTab);
  const pickService = useScheduler((s) => s.pickService);

  const group = SERVICE_GROUPS.find((g) => g.key === svcTab) ?? SERVICE_GROUPS[0];

  return (
    <div>
      <div className="tab-strip" role="tablist">
        {SERVICE_GROUPS.map((g) => (
          <button
            className={`tab${g.key === group.key ? ' tab--on' : ''}`}
            type="button"
            role="tab"
            aria-selected={g.key === group.key}
            key={g.key}
            onClick={() => setSvcTab(g.key)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="svc-group-label">{group.label}</div>

      <div className="svc-cards">
        {group.items.map((sv) => {
          const on = selected === sv.id;
          const type = TYPES[sv.t];
          return (
            <button
              className="svc-card"
              type="button"
              aria-pressed={on}
              key={sv.id}
              style={
                on
                  ? { borderColor: type.border, borderTopColor: type.border, boxShadow: `0 0 0 3px ${type.bg}` }
                  : undefined
              }
              onClick={() => pickService(sv)}
            >
              <span className="svc-card__name">{sv.name}</span>
              <span className="svc-card__meta">
                <span className="svc-card__price">{sv.price}</span>
                <span className="svc-card__dur">{durationLabel(sv.du)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
