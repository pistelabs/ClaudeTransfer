"use client"

import * as React from "react"
import { ImageIcon, Trash2Icon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { CURRENCIES, DATE_FORMATS } from "@/lib/workshop/data"
import { errorMessage, useWorkshop } from "@/lib/workshop/store"
import type { GeneralSettings } from "@/lib/workshop/types"
import { cn } from "@/lib/utils"

export function GeneralSection() {
  const { status, error, reload, usingMockApi, general } = useWorkshop()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em]">General</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your workshop details and how dates and prices are shown.
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

      {status === "loading" ? <GeneralSkeleton /> : null}

      {status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load settings</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Keyed on the loaded values so the form starts from what the API returned. */}
      {status === "ready" ? <GeneralForm key={JSON.stringify(general)} general={general} /> : null}
    </div>
  )
}

function GeneralForm({ general }: { general: GeneralSettings }) {
  const { updateGeneralSettings, uploadLogo, removeLogo } = useWorkshop()
  const [draft, setDraft] = React.useState<GeneralSettings>(() => ({ ...general }))
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const set = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const dirty =
    draft.name !== general.name ||
    draft.email !== general.email ||
    draft.phone !== general.phone ||
    draft.address !== general.address ||
    draft.currency !== general.currency ||
    draft.dateFormat !== general.dateFormat

  const save = async () => {
    setSaving(true)
    try {
      await updateGeneralSettings({ ...draft, name: draft.name.trim() })
      toast.success("Settings saved")
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setSaving(false)
    }
  }

  const upload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      await uploadLogo(file)
      toast.success("Logo updated")
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workshop details</CardTitle>
          <CardDescription>
            Shown to customers on bookings, and used as the default recipient for notification test
            sends.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label>Shop logo</Label>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragOver(false)
                  void upload(event.dataTransfer.files[0])
                }}
                className={cn(
                  "flex size-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/40 px-3 text-center transition-colors duration-[120ms] hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  dragOver && "border-primary bg-primary/[0.07]",
                )}
              >
                {general.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={general.logo}
                    alt="Shop logo"
                    className="max-h-24 max-w-24 object-contain"
                  />
                ) : (
                  <>
                    <ImageIcon className="size-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Drop or click</span>
                  </>
                )}
              </button>

              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-muted-foreground">
                  PNG or SVG, square works best. One image is stored.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    <UploadIcon />
                    {uploading ? "Uploading…" : general.logo ? "Replace" : "Upload"}
                  </Button>
                  {general.logo ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={async () => {
                        try {
                          await removeLogo()
                          toast.success("Logo removed")
                        } catch (cause) {
                          toast.error(errorMessage(cause))
                        }
                      }}
                    >
                      <Trash2Icon />
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  void upload(event.target.files?.[0])
                  event.target.value = ""
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="workshop-name">Workshop name</Label>
            <Input
              id="workshop-name"
              value={draft.name}
              placeholder="e.g. Alpine Werks"
              onChange={(event) => set("name", event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Contact email</Label>
              <Input
                id="contact-email"
                type="email"
                value={draft.email}
                placeholder="hello@example.com"
                onChange={(event) => set("email", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={draft.phone}
                placeholder="+41 79 000 00 00"
                onChange={(event) => set("phone", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={draft.address}
              placeholder="Street, town"
              onChange={(event) => set("address", event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regional</CardTitle>
          <CardDescription>How prices and dates are shown across the console.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={draft.currency}
                onValueChange={(value) => set("currency", value as GeneralSettings["currency"])}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date-format">Date format</Label>
              <Select
                value={draft.dateFormat}
                onValueChange={(value) => set("dateFormat", value as GeneralSettings["dateFormat"])}
              >
                <SelectTrigger id="date-format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={!dirty || saving} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </>
  )
}

function GeneralSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-28 w-28" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
