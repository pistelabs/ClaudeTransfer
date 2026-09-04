"use client"

import {
  CircleIcon,
  PlusIcon,
  SquareIcon,
  Trash2Icon,
  UploadIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { FIELD_TYPE_LABELS, localId } from "@/lib/workshop/data"
import type { FieldType, RequiredField, SelectMode } from "@/lib/workshop/types"

/**
 * Repeatable field list — label + type, with the option builder revealed for
 * "Predefined options". Shared by the service dialog and the appointment dialog.
 */
export function RequiredFieldsEditor({
  fields,
  onChange,
  emptyMessage = "No required fields. Add one to capture info like binding position or rider weight.",
  labelPlaceholder = "Field label (e.g. Rider weight)",
  /** Booking fields only: offers a toggle that mirrors the field into Customer information. */
  showCopyToCustomer = false,
}: {
  fields: RequiredField[]
  onChange: (fields: RequiredField[]) => void
  emptyMessage?: string
  labelPlaceholder?: string
  showCopyToCustomer?: boolean
}) {
  const update = (key: string, patch: Partial<RequiredField>) =>
    onChange(fields.map((field) => (field.key === key ? { ...field, ...patch } : field)))

  const setType = (field: RequiredField, type: FieldType) => {
    const options =
      type === "options" && field.options.length === 0
        ? [{ key: localId("option"), value: "" }]
        : field.options
    update(field.key, { type, options })
  }

  if (fields.length === 0) {
    return (
      <div className="rounded-md border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <div key={field.key} className="rounded-md border p-3">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Label htmlFor={"label-" + field.key} className="sr-only">
                Field label
              </Label>
              <Input
                id={"label-" + field.key}
                value={field.label}
                placeholder={labelPlaceholder}
                onChange={(event) => update(field.key, { label: event.target.value })}
              />
            </div>
            <Select
              value={field.type}
              onValueChange={(value) => setType(field, value as FieldType)}
            >
              <SelectTrigger className="w-[172px]" aria-label="Field type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {FIELD_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showCopyToCustomer ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={field.copyToCustomer ? "secondary" : "ghost"}
                    size="icon"
                    aria-label="Copy to Customer information"
                    aria-pressed={!!field.copyToCustomer}
                    onClick={() => update(field.key, { copyToCustomer: !field.copyToCustomer })}
                  >
                    <UserPlusIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {field.copyToCustomer
                    ? "Also asked on Customer information"
                    : "Copy to Customer information"}
                </TooltipContent>
              </Tooltip>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove field"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onChange(fields.filter((f) => f.key !== field.key))}
            >
              <Trash2Icon />
            </Button>
          </div>

          {field.type === "options" ? (
            <div className="mt-3 flex flex-col gap-2 rounded-md bg-muted/60 p-3">
              <div className="flex items-center gap-3">
                <span className="text-[12.5px] text-muted-foreground">Customer can select:</span>
                <Tabs
                  value={field.selectMode}
                  onValueChange={(value) => update(field.key, { selectMode: value as SelectMode })}
                >
                  <TabsList className="h-8 bg-background">
                    <TabsTrigger value="single" className="text-xs">
                      Single select
                    </TabsTrigger>
                    <TabsTrigger value="multi" className="text-xs">
                      Multi select
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {field.options.map((option) => (
                <div key={option.key} className="flex items-center gap-2">
                  <span className="text-muted-foreground/60">
                    {field.selectMode === "multi" ? (
                      <SquareIcon className="size-4" />
                    ) : (
                      <CircleIcon className="size-4" />
                    )}
                  </span>
                  <Input
                    value={option.value}
                    placeholder="Option label"
                    aria-label="Option label"
                    className="h-8 bg-background"
                    onChange={(event) =>
                      update(field.key, {
                        options: field.options.map((o) =>
                          o.key === option.key ? { ...o, value: event.target.value } : o,
                        ),
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label="Remove option"
                    onClick={() =>
                      update(field.key, {
                        options: field.options.filter((o) => o.key !== option.key),
                      })
                    }
                  >
                    <XIcon />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start bg-background"
                onClick={() =>
                  update(field.key, {
                    options: [...field.options, { key: localId("option"), value: "" }],
                  })
                }
              >
                <PlusIcon />
                Add option
              </Button>
            </div>
          ) : null}

          {field.type === "file" ? (
            <p className="mt-3 flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <UploadIcon className="size-4 shrink-0" />
              File upload — lets the customer attach a photo or document (e.g. equipment photo, ID).
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
