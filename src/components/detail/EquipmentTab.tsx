import { Minus, Plus, Trash2, X } from 'lucide-react';
import {
  EQUIP_KINDS,
  EQUIP_SIDES,
  REPEATABLE_SERVICES,
  equipFlex,
  equipServiceGroups,
  equipSizes,
} from '../../data/catalogue';
import { useScheduler } from '../../store/useScheduler';
import type { EquipItem } from '../../types';
import { PartyPills } from './PartyPills';
import type { DetailInfo } from './useDetail';

export function EquipmentTab({ detail }: { detail: DetailInfo }) {
  return (
    <div>
      <PartyPills detail={detail} />
      <div className="section-label" style={{ marginTop: 16 }}>
        Equipment on this appointment
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 11 }}>
        {detail.equipment.map((item) => (
          <EquipmentEntry item={item} key={item.uid} />
        ))}
      </div>
    </div>
  );
}

/** One piece of equipment plus the services applied to it. Always open — no "add" gate. */
function EquipmentEntry({ item }: { item: EquipItem }) {
  const updateEquip = useScheduler((s) => s.updateEquip);
  const removeEquip = useScheduler((s) => s.removeEquip);
  const setEquipTab = useScheduler((s) => s.setEquipTab);
  const toggleService = useScheduler((s) => s.toggleEquipService);
  const addInstance = useScheduler((s) => s.addEquipServiceInstance);
  const removeLast = useScheduler((s) => s.removeLastEquipService);
  const removeInstance = useScheduler((s) => s.removeEquipServiceInstance);
  const updateService = useScheduler((s) => s.updateEquipService);

  const groups = equipServiceGroups(item.kind);
  const group = groups.find((g) => g.key === item.tab) ?? groups[0];
  const flexOptions = equipFlex(item.kind);

  return (
    <div className="equip">
      <div className="equip__row">
        <div style={{ flex: '0 0 130px' }}>
          <label className="equip__label">Equipment</label>
          <select
            className="equip__input"
            value={item.kind}
            onChange={(e) => updateEquip(item.uid, 'kind', e.target.value)}
          >
            {EQUIP_KINDS.map((k) => (
              <option value={k} key={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 170px', minWidth: 150 }}>
          <label className="equip__label">Make &amp; model</label>
          <input
            className="equip__input"
            value={item.model}
            placeholder="e.g. Lange RX 120"
            onChange={(e) => updateEquip(item.uid, 'model', e.target.value)}
          />
        </div>
        <div style={{ flex: '0 0 96px' }}>
          <label className="equip__label">Size</label>
          <select
            className="equip__input"
            value={item.size}
            onChange={(e) => updateEquip(item.uid, 'size', e.target.value)}
          >
            <option value="">Size…</option>
            {equipSizes(item.kind).map((s) => (
              <option value={s} key={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {flexOptions.length > 0 && (
          <div style={{ flex: '0 0 92px' }}>
            <label className="equip__label">Flex</label>
            <select
              className="equip__input"
              value={item.flex}
              onChange={(e) => updateEquip(item.uid, 'flex', e.target.value)}
            >
              <option value="">Flex…</option>
              {flexOptions.map((f) => (
                <option value={f} key={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}
        <button className="equip__delete" type="button" title="Remove" onClick={() => removeEquip(item.uid)}>
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>

      <div className="equip__services">
        <div className="equip__services-head">
          <div className="answer-label">Services</div>
          <div className="equip__svc-count">
            {item.services.length === 0 ? 'None selected' : `${item.services.length} selected`}
          </div>
        </div>

        <div className="equip__svc-tabs" role="tablist">
          {groups.map((g) => (
            <button
              className={`equip__svc-tab${g.key === group?.key ? ' equip__svc-tab--on' : ''}`}
              type="button"
              role="tab"
              aria-selected={g.key === group?.key}
              key={g.key}
              onClick={() => setEquipTab(item.uid, g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="equip__svc-group">{group?.label ?? ''}</div>

        <div className="equip__svc-cards">
          {(group?.items ?? []).map((svc) => {
            const count = item.services.filter((s) => s.name === svc.name).length;
            const on = count > 0;
            // Some services genuinely repeat on one item — a punch per pressure point.
            const repeatable = REPEATABLE_SERVICES.includes(svc.name);
            return (
              <button
                className={`equip__svc-card${on ? ' equip__svc-card--on' : ''}`}
                type="button"
                aria-pressed={on}
                key={svc.name}
                style={on && group ? { borderColor: group.accent, borderTopColor: group.accent } : undefined}
                onClick={() => toggleService(item.uid, svc.name, svc.price)}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="equip__svc-name">{svc.name}</span>
                  <span className="equip__svc-price">{svc.price}</span>
                </span>
                {on && repeatable && (
                  <span className="counter" onClick={(e) => e.stopPropagation()}>
                    <span
                      className="counter__btn"
                      role="button"
                      tabIndex={0}
                      title="Remove one"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLast(item.uid, svc.name);
                      }}
                    >
                      <Minus size={13} strokeWidth={2.4} />
                    </span>
                    <span className="counter__value">{count}</span>
                    <span
                      className="counter__btn counter__btn--add"
                      role="button"
                      tabIndex={0}
                      title="Add another"
                      onClick={(e) => {
                        e.stopPropagation();
                        addInstance(item.uid, svc.name, svc.price);
                      }}
                    >
                      <Plus size={13} strokeWidth={2.4} />
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {item.services.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {item.services.map((svc) => {
              // Repeated services are numbered so each punch reads as its own entry.
              const dupes = item.services.filter((x) => x.name === svc.name);
              const suffix = dupes.length > 1 ? ` #${dupes.indexOf(svc) + 1}` : '';
              return (
                <div className="equip-entry" key={svc.sid}>
                  <div className="equip-entry__head">
                    <span className="equip-entry__name">
                      {svc.name}
                      {suffix}
                    </span>
                    <span className="equip-entry__price">{svc.price}</span>
                    <button
                      className="equip-entry__remove"
                      type="button"
                      title="Remove service"
                      onClick={() => removeInstance(item.uid, svc.sid)}
                    >
                      <X size={15} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="equip-entry__fields">
                    <div style={{ flex: '1 1 170px', minWidth: 140 }}>
                      <label className="equip__label">Location</label>
                      <input
                        className="equip-entry__input"
                        value={svc.location}
                        placeholder="e.g. Sixth toe, navicular"
                        onChange={(e) => updateService(item.uid, svc.sid, 'location', e.target.value)}
                      />
                    </div>
                    <div style={{ flex: '0 0 110px' }}>
                      <label className="equip__label">Side</label>
                      <select
                        className="equip-entry__input"
                        value={svc.side}
                        onChange={(e) => updateService(item.uid, svc.sid, 'side', e.target.value)}
                      >
                        {EQUIP_SIDES.map((s) => (
                          <option value={s} key={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: '1 1 170px', minWidth: 140 }}>
                      <label className="equip__label">Note</label>
                      <input
                        className="equip-entry__input"
                        value={svc.note}
                        placeholder="Optional detail"
                        onChange={(e) => updateService(item.uid, svc.sid, 'note', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
