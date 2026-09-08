import { useAppStore } from "../../store/useAppStore";
import { EQUIPMENT_CATEGORIES, type EquipmentCategory } from "../../types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function NewEquipmentForm() {
  const nf = useAppStore((s) => s.nf);
  const patchNf = useAppStore((s) => s.patchNf);
  const nfSetCategory = useAppStore((s) => s.nfSetCategory);

  return (
    <div className="order-1 flex min-w-0 flex-col gap-[9px]">
      <span className="text-muted-foreground text-[10.5px] font-bold tracking-wide uppercase">
        Enter new equipment
      </span>
      <div className="flex gap-2">
        <Select value={nf.category} onValueChange={(v) => nfSetCategory(v as EquipmentCategory)}>
          <SelectTrigger className="w-[142px] shrink-0 font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={nf.brand}
          onChange={(e) => patchNf({ brand: e.target.value })}
          placeholder="Brand"
          className="min-w-0 flex-1 font-semibold"
        />
        <Input
          value={nf.model}
          onChange={(e) => patchNf({ model: e.target.value })}
          placeholder="Model"
          className="min-w-0 flex-[1.2]"
        />
      </div>
      <div className="flex gap-2">
        <Input
          value={nf.size}
          onChange={(e) => patchNf({ size: e.target.value })}
          placeholder="Size"
          className="min-w-0 flex-1"
        />
        <Input
          value={nf.colour}
          onChange={(e) => patchNf({ colour: e.target.value })}
          placeholder="Colour"
          className="min-w-0 flex-1"
        />
      </div>
    </div>
  );
}
