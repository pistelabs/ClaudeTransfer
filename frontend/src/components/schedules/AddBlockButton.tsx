import { ChevronDownIcon, PlusIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface CopyOption {
  value: string
  label: string
}

interface AddBlockButtonProps {
  onAdd: () => void
  copyOptions: CopyOption[]
  onCopyFrom: (day: string) => void
}

/**
 * Split control: "Add block" on the left, a chevron section on the right that
 * copies an existing day's blocks in. The prototype used an invisible native
 * select here; this is the shadcn `DropdownMenu` the handoff asks for.
 */
export function AddBlockButton({
  onAdd,
  copyOptions,
  onCopyFrom,
}: AddBlockButtonProps) {
  return (
    <div className="border-border hover:border-sky-300 flex items-stretch overflow-hidden rounded-lg border border-dashed transition-colors">
      <button
        type="button"
        onClick={onAdd}
        className="text-muted-foreground hover:text-primary-hover hover:bg-sky-50 focus-ring flex flex-1 items-center justify-center gap-1.5 py-2 text-[12.5px] font-medium transition-colors"
      >
        <PlusIcon className="size-3.5" />
        Add block
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="border-border text-placeholder-foreground hover:text-primary-hover hover:bg-sky-50 focus-ring flex w-[30px] items-center justify-center border-l border-dashed transition-colors disabled:opacity-40"
          disabled={copyOptions.length === 0}
          aria-label="Copy blocks from another day"
        >
          <ChevronDownIcon className="size-3.5" strokeWidth={2.2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Copy from</DropdownMenuLabel>
          {copyOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onCopyFrom(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
