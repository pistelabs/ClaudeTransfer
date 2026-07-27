import { STAGE_DEFS } from "../../store/useAppStore";
import { CheckedInEquipmentPanel } from "./CheckedInEquipmentPanel";
import { StageColumn } from "./StageColumn";

export function Board() {
  return (
    <div className="flex flex-1 items-stretch gap-3.5 overflow-x-auto overflow-y-hidden p-4">
      <CheckedInEquipmentPanel />
      {STAGE_DEFS.map((def) => (
        <StageColumn key={def.key} stageKey={def.key} label={def.label} dot={def.dot} />
      ))}
    </div>
  );
}
