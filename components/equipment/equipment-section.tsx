"use client"

import * as React from "react"
import { SnowflakeIcon } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SelectableTile } from "@/components/workshop/selectable-tile"
import { errorMessage, useWorkshop } from "@/lib/workshop/store"
import type { Id } from "@/lib/workshop/types"

export function EquipmentSection() {
  const { status, error, reload, usingMockApi, equipmentTypes, setEnabledEquipmentTypes } =
    useWorkshop()
  const [saving, setSaving] = React.useState(false)

  const enabledIds = equipmentTypes.filter((type) => type.enabled).map((type) => type.id)
  const allEnabled = equipmentTypes.length > 0 && enabledIds.length === equipmentTypes.length

  const commit = async (ids: Id[]) => {
    setSaving(true)
    try {
      await setEnabledEquipmentTypes(ids)
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setSaving(false)
    }
  }

  const toggle = (id: Id) =>
    commit(
      enabledIds.includes(id)
        ? enabledIds.filter((current) => current !== id)
        : [...enabledIds, id],
    )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em]">Equipment Types</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Select the equipment types your workshop offers.
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

      {status === "loading" ? <EquipmentSkeleton /> : null}

      {status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load equipment types</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {status === "ready" ? (
        <Card>
          <CardHeader className="items-center border-b">
            <CardTitle className="text-base">Available equipment</CardTitle>
            <CardDescription>
              {enabledIds.length} of {equipmentTypes.length} selected — only these can be assigned
              to services and appointments.
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                disabled={saving || equipmentTypes.length === 0}
                onClick={() => commit(allEnabled ? [] : equipmentTypes.map((type) => type.id))}
              >
                {allEnabled ? "Clear all" : "Select all"}
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            {equipmentTypes.length === 0 ? (
              <div className="px-6 py-11 text-center">
                <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <SnowflakeIcon className="size-5" />
                </div>
                <div className="text-sm font-semibold">No equipment types yet</div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Types are seeded in Django — add them there to offer them here.
                </p>
              </div>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {equipmentTypes.map((type) => (
                  <SelectableTile
                    key={type.id}
                    label={type.name}
                    selected={type.enabled}
                    onSelect={() => toggle(type.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function EquipmentSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-2 h-4 w-72" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
