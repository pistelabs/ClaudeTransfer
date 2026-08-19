"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { errorMessage } from "@/lib/workshop/store"

/** Add / rename a service group. Enter submits. */
export function GroupDialog({
  open,
  onOpenChange,
  initialName,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Existing group name when renaming, null when adding. */
  initialName: string | null
  onSubmit: (name: string) => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        {/* Mounted only while open, so the field always starts from a fresh draft. */}
        <GroupForm
          initialName={initialName}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function GroupForm({
  initialName,
  onCancel,
  onSubmit,
}: {
  initialName: string | null
  onCancel: () => void
  onSubmit: (name: string) => Promise<void>
}) {
  const [name, setName] = React.useState(initialName ?? "")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canSave = name.trim().length > 0 && !saving
  const submit = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit(name.trim())
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initialName === null ? "Add group" : "Rename group"}</DialogTitle>
        <DialogDescription>Name a group that services will be organised under.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="group-name">Group name</Label>
        <Input
          id="group-name"
          autoFocus
          value={name}
          placeholder="e.g. Standard tunes"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              void submit()
            }
          }}
        />
        {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
      </div>
      <DialogFooter>
        <Button variant="outline" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!canSave} onClick={submit}>
          {saving ? "Saving…" : initialName === null ? "Create" : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  )
}
