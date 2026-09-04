"use client"

import * as React from "react"
import { LockIcon, MailIcon, MessageSquareIcon, PencilIcon } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MessageEditorDialog } from "@/components/notifications/message-editor-dialog"
import { DEFAULT_GENERAL, toNotificationEventInput } from "@/lib/workshop/data"
import { errorMessage, useWorkshop } from "@/lib/workshop/store"
import type {
  Id,
  NotificationChannel,
  NotificationEvent,
  NotificationEventInput,
} from "@/lib/workshop/types"
import { cn } from "@/lib/utils"

type EditorState = { open: boolean; event: NotificationEvent | null; channel: NotificationChannel }

export function NotificationsSection() {
  const {
    status,
    error,
    reload,
    usingMockApi,
    notificationEvents,
    sendingDomain,
    updateNotificationEvent,
    sendNotificationTest,
  } = useWorkshop()

  const [editor, setEditor] = React.useState<EditorState>({
    open: false,
    event: null,
    channel: "sms",
  })
  /** Ids of events with a request in flight, so their controls stay disabled. */
  const [busyIds, setBusyIds] = React.useState<Id[]>([])

  const patchEvent = async (event: NotificationEvent, patch: Partial<NotificationEventInput>) => {
    setBusyIds((ids) => [...ids, event.id])
    try {
      await updateNotificationEvent(event.id, { ...toNotificationEventInput(event), ...patch })
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setBusyIds((ids) => ids.filter((id) => id !== event.id))
    }
  }

  const activeCount = notificationEvents.filter((event) => event.enabled).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em]">Notifications</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Manage the SMS and email messages sent to customers and staff.
        </p>
      </div>

      {usingMockApi ? (
        <Alert>
          <AlertTitle>Not connected to Django</AlertTitle>
          <AlertDescription>
            NEXT_PUBLIC_API_BASE_URL is not set, so changes are kept in memory and lost on reload.
          </AlertDescription>
        </Alert>
      ) : null}

      {status === "loading" ? <NotificationsSkeleton /> : null}

      {status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load notifications</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {status === "ready" ? (
        <>
          <Card>
            <CardContent>
              <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,480px)_1fr]">
                <div className="grid gap-2">
                  <Label htmlFor="sending-domain">Company sending domain</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      <LockIcon className="size-3.5" />
                    </span>
                    <Input
                      id="sending-domain"
                      value={sendingDomain}
                      readOnly
                      disabled
                      className="bg-muted pl-9 text-muted-foreground"
                    />
                  </div>
                </div>
                <p className="text-[13px] text-muted-foreground">
                  All customer and staff notifications are sent from this address.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 overflow-hidden pb-0">
            <CardHeader className="pb-5">
              <CardTitle className="text-base">Notification events</CardTitle>
              <CardDescription>
                {activeCount} of {notificationEvents.length} active
              </CardDescription>
            </CardHeader>

            <div className="border-t">
              {/* EVENT | SMS MESSAGE | EMAIL MESSAGE | ACTIVE */}
              <div className="grid grid-cols-[1fr_190px_190px_70px] gap-3 border-b bg-muted/50 px-5 py-2.5 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase max-lg:hidden">
                <div>Event</div>
                <div>SMS message</div>
                <div>Email message</div>
                <div className="text-right">Active</div>
              </div>

              {notificationEvents.map((event) => (
                <NotificationRow
                  key={event.id}
                  event={event}
                  busy={busyIds.includes(event.id)}
                  onToggleChannel={(channel) =>
                    patchEvent(
                      event,
                      channel === "sms"
                        ? { smsEnabled: !event.smsEnabled }
                        : { emailEnabled: !event.emailEnabled },
                    )
                  }
                  onToggleEnabled={() => patchEvent(event, { enabled: !event.enabled })}
                  onEdit={(channel) => setEditor({ open: true, event, channel })}
                />
              ))}
            </div>
          </Card>
        </>
      ) : null}

      <MessageEditorDialog
        open={editor.open}
        onOpenChange={(open) => setEditor((state) => ({ ...state, open }))}
        event={editor.event}
        channel={editor.channel}
        defaultRecipient={editor.channel === "sms" ? DEFAULT_GENERAL.phone : DEFAULT_GENERAL.email}
        onSave={async (patch) => {
          if (!editor.event) return
          try {
            await updateNotificationEvent(editor.event.id, {
              ...toNotificationEventInput(editor.event),
              ...patch,
            })
            toast.success(editor.event.name + " message saved")
            setEditor((state) => ({ ...state, open: false }))
          } catch (cause) {
            toast.error(errorMessage(cause))
          }
        }}
        onSendTest={async (recipient) => {
          if (!editor.event) return
          await sendNotificationTest(editor.event.id, editor.channel, recipient)
        }}
      />
    </div>
  )
}

function NotificationRow({
  event,
  busy,
  onToggleChannel,
  onToggleEnabled,
  onEdit,
}: {
  event: NotificationEvent
  busy: boolean
  onToggleChannel: (channel: NotificationChannel) => void
  onToggleEnabled: () => void
  onEdit: (channel: NotificationChannel) => void
}) {
  const dimmed = !event.enabled

  return (
    <div className="grid grid-cols-[1fr_190px_190px_70px] items-center gap-3 border-b px-5 py-3.5 transition-colors duration-[120ms] last:border-b-0 hover:bg-muted/40 max-lg:grid-cols-1 max-lg:gap-4">
      <div className={cn("flex min-w-0 items-start gap-3", dimmed && "opacity-55")}>
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <MailIcon className="size-4" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{event.name}</span>
            <Badge variant="secondary" className="capitalize">
              {event.audience}
            </Badge>
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{event.description}</p>
        </div>
      </div>

      <ChannelCell
        channel="sms"
        label="SMS"
        icon={<MessageSquareIcon className="size-3.5" />}
        configured={event.smsEnabled}
        dimmed={dimmed}
        busy={busy}
        onToggle={() => onToggleChannel("sms")}
        onEdit={() => onEdit("sms")}
      />

      <ChannelCell
        channel="email"
        label="Email"
        icon={<MailIcon className="size-3.5" />}
        configured={event.emailEnabled}
        dimmed={dimmed}
        busy={busy}
        onToggle={() => onToggleChannel("email")}
        onEdit={() => onEdit("email")}
      />

      <div className="flex justify-end">
        <Switch
          checked={event.enabled}
          disabled={busy}
          onCheckedChange={onToggleEnabled}
          aria-label={event.enabled ? "Disable " + event.name : "Enable " + event.name}
        />
      </div>
    </div>
  )
}

function ChannelCell({
  channel,
  label,
  icon,
  configured,
  dimmed,
  busy,
  onToggle,
  onEdit,
}: {
  channel: NotificationChannel
  label: string
  icon: React.ReactNode
  /** True when this channel is switched on for the event. */
  configured: boolean
  dimmed: boolean
  busy: boolean
  onToggle: () => void
  onEdit: () => void
}) {
  return (
    <div className={cn("flex items-center gap-2", dimmed && "opacity-55")}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            aria-pressed={configured}
            disabled={busy || dimmed}
            onClick={onToggle}
            className={cn(
              "rounded-full",
              configured
                ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                : "text-muted-foreground",
            )}
          >
            {icon}
            {label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {configured ? label + " is on — click to turn off" : "Turn " + label + " on"}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label={"Edit " + label + " message"}
            disabled={dimmed}
            onClick={onEdit}
          >
            <PencilIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit {channel === "sms" ? "SMS" : "email"} message</TooltipContent>
      </Tooltip>
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <Skeleton className="h-9 w-[420px] max-w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-24" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
