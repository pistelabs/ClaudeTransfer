"use client"

import * as React from "react"
import { ImageIcon, PlusIcon, SendIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { SectionLabel } from "@/components/workshop/section-label"
import { IMAGE_PLACEMENTS, MERGE_TAGS, recordTestSend, testSendAllowed } from "@/lib/workshop/data"
import { localId } from "@/lib/workshop/data"
import { errorMessage } from "@/lib/workshop/store"
import type {
  EmailImage,
  ImagePlacement,
  MessageMode,
  NotificationChannel,
  NotificationEvent,
  NotificationEventInput,
} from "@/lib/workshop/types"

interface Draft {
  mode: MessageMode
  subject: string
  body: string
  images: EmailImage[]
  timingHours: string
}

export function MessageEditorDialog({
  open,
  onOpenChange,
  event,
  channel,
  defaultRecipient,
  onSave,
  onSendTest,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: NotificationEvent | null
  channel: NotificationChannel
  /** Admin phone or email from General settings. */
  defaultRecipient: string
  onSave: (input: Partial<NotificationEventInput>) => Promise<void>
  onSendTest: (recipient: string) => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid max-h-[calc(100vh-48px)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 p-0 sm:max-w-[560px]"
      >
        {/* Mounted only while open, so every open starts from a fresh draft. */}
        {event ? (
          <MessageForm
            event={event}
            channel={channel}
            defaultRecipient={defaultRecipient}
            onCancel={() => onOpenChange(false)}
            onSave={onSave}
            onSendTest={onSendTest}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function MessageForm({
  event,
  channel,
  defaultRecipient,
  onCancel,
  onSave,
  onSendTest,
}: {
  event: NotificationEvent
  channel: NotificationChannel
  defaultRecipient: string
  onCancel: () => void
  onSave: (input: Partial<NotificationEventInput>) => Promise<void>
  onSendTest: (recipient: string) => Promise<void>
}) {
  const isSms = channel === "sms"
  const [draft, setDraft] = React.useState<Draft>(() => ({
    mode: isSms ? event.smsMode : event.emailMode,
    subject: event.emailSubject || event.emailDefaultSubject,
    body: isSms ? event.smsBody || event.smsDefaultBody : event.emailBody || event.emailDefaultBody,
    images: structuredClone(event.emailImages),
    timingHours: event.timing ? String(event.timing.hours) : "",
  }))
  const [saving, setSaving] = React.useState(false)
  const [recipientOpen, setRecipientOpen] = React.useState(false)
  const [recipient, setRecipient] = React.useState(defaultRecipient)
  const [sending, setSending] = React.useState(false)
  const [limitMessage, setLimitMessage] = React.useState<string | null>(null)
  const bodyRef = React.useRef<HTMLTextAreaElement>(null)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const isDefault = draft.mode === "default"
  const defaultBody = isSms ? event.smsDefaultBody : event.emailDefaultBody
  const shownBody = isDefault ? defaultBody : draft.body

  /** Drops a merge tag in at the cursor. */
  const insertTag = (tag: string) => {
    const textarea = bodyRef.current
    if (!textarea) {
      set("body", draft.body + tag)
      return
    }
    const start = textarea.selectionStart ?? draft.body.length
    const end = textarea.selectionEnd ?? draft.body.length
    const next = draft.body.slice(0, start) + tag + draft.body.slice(end)
    set("body", next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + tag.length, start + tag.length)
    })
  }

  const validRecipient = isSms
    ? /^[+\d][\d\s()-]{6,}$/.test(recipient.trim())
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.trim())

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(
        isSms
          ? {
              smsMode: draft.mode,
              smsBody: draft.body,
              ...(event.timing
                ? { timing: { ...event.timing, hours: parseInt(draft.timingHours, 10) || 0 } }
                : {}),
            }
          : {
              emailMode: draft.mode,
              emailSubject: draft.subject,
              emailBody: draft.body,
              emailImages: draft.images,
              ...(event.timing
                ? { timing: { ...event.timing, hours: parseInt(draft.timingHours, 10) || 0 } }
                : {}),
            },
      )
    } finally {
      setSaving(false)
    }
  }

  const handleSendTest = async () => {
    if (!recipientOpen) {
      setRecipientOpen(true)
      return
    }
    if (!validRecipient) return
    // Max 15 test sends per rolling hour across SMS and email.
    if (!testSendAllowed()) {
      setLimitMessage("Test-send limit reached. Try again later.")
      return
    }
    setSending(true)
    setLimitMessage(null)
    try {
      await onSendTest(recipient.trim())
      recordTestSend()
      toast.success("Test " + (isSms ? "SMS" : "email") + " sent to " + recipient.trim())
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <DialogHeader className="border-b px-6 py-5">
        <DialogTitle className="text-lg font-semibold tracking-[-0.01em]">
          {event.name} — {isSms ? "SMS" : "email"}
        </DialogTitle>
        <DialogDescription>{event.description}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-5 overflow-y-auto px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <SectionLabel>Message</SectionLabel>
          <Tabs value={draft.mode} onValueChange={(value) => set("mode", value as MessageMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="default" className="text-xs">
                Default
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs">
                Custom
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {!isSms ? (
          <div className="grid gap-2">
            <Label htmlFor="message-subject">Subject line</Label>
            <Input
              id="message-subject"
              value={isDefault ? event.emailDefaultSubject : draft.subject}
              readOnly={isDefault}
              disabled={isDefault}
              placeholder="Subject customers see in their inbox"
              onChange={(teEvent) => set("subject", teEvent.target.value)}
            />
          </div>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="message-body">Message</Label>
          <Textarea
            id="message-body"
            ref={bodyRef}
            rows={isSms ? 4 : 8}
            value={shownBody}
            readOnly={isDefault}
            disabled={isDefault}
            placeholder="Message sent to the customer"
            onChange={(teEvent) => set("body", teEvent.target.value)}
          />
          {isDefault ? (
            <p className="text-xs text-muted-foreground">
              The default copy is used. Switch to Custom to write your own.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Insert:</span>
              {MERGE_TAGS.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 font-mono text-xs"
                  onClick={() => insertTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        {!isSms ? (
          <>
            <Separator />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Images</SectionLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    set("images", [
                      ...draft.images,
                      { key: localId("image"), src: "", placement: "header" },
                    ])
                  }
                >
                  <PlusIcon />
                  Add image
                </Button>
              </div>
              {draft.images.length === 0 ? (
                <p className="rounded-md border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
                  No images. Add one to show a logo or banner in the email.
                </p>
              ) : (
                draft.images.map((image) => (
                  <div key={image.key} className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      <ImageIcon className="size-4" />
                    </span>
                    <Input
                      value={image.src}
                      placeholder="Image URL"
                      aria-label="Image URL"
                      onChange={(teEvent) =>
                        set(
                          "images",
                          draft.images.map((current) =>
                            current.key === image.key
                              ? { ...current, src: teEvent.target.value }
                              : current,
                          ),
                        )
                      }
                    />
                    <Select
                      value={image.placement}
                      onValueChange={(value) =>
                        set(
                          "images",
                          draft.images.map((current) =>
                            current.key === image.key
                              ? { ...current, placement: value as ImagePlacement }
                              : current,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="w-[150px]" aria-label="Image position">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_PLACEMENTS.map((placement) => (
                          <SelectItem key={placement.value} value={placement.value}>
                            {placement.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove image"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        set(
                          "images",
                          draft.images.filter((current) => current.key !== image.key),
                        )
                      }
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}

        {event.timing ? (
          <>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="message-timing">Send timing</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="message-timing"
                  type="number"
                  min={0}
                  step={1}
                  className="w-24 tabular-nums"
                  value={draft.timingHours}
                  onChange={(teEvent) => set("timingHours", teEvent.target.value)}
                />
                <span className="text-[13px] text-muted-foreground">
                  hours {event.timing.when} {event.timing.anchor}
                </span>
              </div>
            </div>
          </>
        ) : null}

        {recipientOpen ? (
          <>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="test-recipient">
                Send test to {isSms ? "phone number" : "email address"}
              </Label>
              <Input
                id="test-recipient"
                value={recipient}
                inputMode={isSms ? "tel" : "email"}
                aria-invalid={!validRecipient}
                placeholder={isSms ? "+41 79 000 00 00" : "you@example.com"}
                onChange={(teEvent) => setRecipient(teEvent.target.value)}
              />
              {!validRecipient ? (
                <p className="text-xs text-destructive">
                  Enter a valid {isSms ? "phone number" : "email address"}.
                </p>
              ) : null}
              {limitMessage ? <p className="text-xs text-destructive">{limitMessage}</p> : null}
            </div>
          </>
        ) : null}
      </div>

      <DialogFooter className="border-t px-6 py-4 sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={sending || (recipientOpen && !validRecipient)}
          onClick={handleSendTest}
        >
          <SendIcon />
          {sending ? "Sending…" : recipientOpen ? "Send now" : "Send test"}
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}
