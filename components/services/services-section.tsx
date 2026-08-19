"use client"

import * as React from "react"
import { PencilIcon, PlusIcon, Trash2Icon, WrenchIcon } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ConfirmDeleteDialog } from "@/components/services/confirm-delete-dialog"
import { GroupDialog } from "@/components/services/group-dialog"
import { ServiceDialog } from "@/components/services/service-dialog"
import { ServiceRow } from "@/components/services/service-row"
import { toServiceInput } from "@/lib/workshop/data"
import { errorMessage, useWorkshop } from "@/lib/workshop/store"
import type { Id, Service, ServiceInput } from "@/lib/workshop/types"

type GroupDialogState = { open: boolean; mode: "add" | "rename" }
type ServiceDialogState = { open: boolean; service: Service | null }
type DeleteState =
  { open: boolean; kind: "group" } | { open: boolean; kind: "service"; service: Service }

export function ServicesSection() {
  const {
    status,
    error,
    reload,
    usingMockApi,
    serviceGroups,
    currencySymbol,
    createServiceGroup,
    renameServiceGroup,
    deleteServiceGroup,
    createService,
    updateService,
    deleteService,
  } = useWorkshop()

  const [activeGroupId, setActiveGroupId] = React.useState<Id>("")
  // Falls back to the first group when nothing is selected or the selection was deleted.
  const activeGroup = serviceGroups.find((group) => group.id === activeGroupId) ?? serviceGroups[0]

  const [groupDialog, setGroupDialog] = React.useState<GroupDialogState>({
    open: false,
    mode: "add",
  })
  const [serviceDialog, setServiceDialog] = React.useState<ServiceDialogState>({
    open: false,
    service: null,
  })
  const [deleteState, setDeleteState] = React.useState<DeleteState | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  /** Ids of services with a request in flight, so their row actions stay disabled. */
  const [busyServiceIds, setBusyServiceIds] = React.useState<Id[]>([])

  const withBusyService = async (serviceId: Id, run: () => Promise<void>) => {
    setBusyServiceIds((ids) => [...ids, serviceId])
    try {
      await run()
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setBusyServiceIds((ids) => ids.filter((id) => id !== serviceId))
    }
  }

  const services = activeGroup?.services ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em]">Services</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Create service groups (e.g. Standard, Additional, Extras) and add the services customers
          can book under each.
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

      {status === "loading" ? <ServicesSkeleton /> : null}

      {status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load services</AlertTitle>
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
          {/* Group selector */}
          <div className="flex flex-wrap items-center gap-2">
            {serviceGroups.length ? (
              <Tabs value={activeGroup?.id ?? ""} onValueChange={setActiveGroupId}>
                <TabsList>
                  {serviceGroups.map((group) => (
                    <TabsTrigger key={group.id} value={group.id} className="gap-2">
                      {group.name}
                      <Badge variant="secondary" className="px-1.5 tabular-nums">
                        {group.services.length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            ) : null}
            <Button variant="outline" onClick={() => setGroupDialog({ open: true, mode: "add" })}>
              <PlusIcon />
              Add group
            </Button>
          </div>

          {activeGroup ? (
            <Card>
              <CardHeader className="items-center border-b">
                <div className="flex items-center gap-2.5">
                  <CardTitle className="text-base">{activeGroup.name}</CardTitle>
                  <Badge variant="secondary">
                    {activeGroup.services.length}{" "}
                    {activeGroup.services.length === 1 ? "service" : "services"}
                  </Badge>
                </div>
                <CardDescription>
                  Services available under &ldquo;{activeGroup.name}&rdquo;
                </CardDescription>
                <CardAction className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Rename group"
                        onClick={() => setGroupDialog({ open: true, mode: "rename" })}
                      >
                        <PencilIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rename group</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete group"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteState({ open: true, kind: "group" })}
                      >
                        <Trash2Icon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete group</TooltipContent>
                  </Tooltip>
                </CardAction>
              </CardHeader>

              <CardContent>
                {/* Services sub-card */}
                <div className="overflow-hidden rounded-lg border">
                  <div className="flex items-start justify-between gap-4 border-b bg-muted/50 px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-semibold">Services</h2>
                        {services.length ? (
                          <Badge variant="secondary" className="tabular-nums">
                            {services.length}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        Shown to customers and staff when booking work in.
                      </p>
                    </div>
                    <Button onClick={() => setServiceDialog({ open: true, service: null })}>
                      <PlusIcon />
                      Add service
                    </Button>
                  </div>

                  {services.length === 0 ? (
                    <div className="px-6 py-11 text-center">
                      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <WrenchIcon className="size-5" />
                      </div>
                      <div className="text-sm font-semibold">No services yet</div>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        Add your first service under this group.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setServiceDialog({ open: true, service: null })}
                      >
                        <PlusIcon />
                        Add service
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {services.map((service) => (
                        <ServiceRow
                          key={service.id}
                          service={service}
                          currencySymbol={currencySymbol}
                          busy={busyServiceIds.includes(service.id)}
                          onEdit={() => setServiceDialog({ open: true, service })}
                          onDuplicate={() =>
                            withBusyService(service.id, async () => {
                              await createService(activeGroup.id, {
                                ...toServiceInput(service),
                                name: service.name + " (copy)",
                              })
                              toast.success(service.name + " duplicated")
                            })
                          }
                          onDelete={() => setDeleteState({ open: true, kind: "service", service })}
                          onToggleVisibility={() =>
                            withBusyService(service.id, async () => {
                              await updateService(service.id, activeGroup.id, {
                                ...toServiceInput(service),
                                disabled: !service.disabled,
                              })
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <WrenchIcon className="size-5" />
                </div>
                <div className="text-sm font-semibold">No service groups yet</div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Groups organise the services your workshop sells.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setGroupDialog({ open: true, mode: "add" })}
                >
                  <PlusIcon />
                  Add group
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      <GroupDialog
        open={groupDialog.open}
        onOpenChange={(open) => setGroupDialog((state) => ({ ...state, open }))}
        initialName={groupDialog.mode === "rename" ? (activeGroup?.name ?? "") : null}
        onSubmit={async (name) => {
          if (groupDialog.mode === "add") {
            const group = await createServiceGroup(name)
            setActiveGroupId(group.id)
            toast.success(name + " group created")
          } else if (activeGroup) {
            await renameServiceGroup(activeGroup.id, name)
            toast.success("Group renamed")
          }
          setGroupDialog((state) => ({ ...state, open: false }))
        }}
      />

      <ServiceDialog
        open={serviceDialog.open}
        onOpenChange={(open) => setServiceDialog((state) => ({ ...state, open }))}
        service={serviceDialog.service}
        onSave={async (input: ServiceInput) => {
          if (!activeGroup) return
          try {
            if (serviceDialog.service) {
              await updateService(serviceDialog.service.id, activeGroup.id, input)
              toast.success(input.name + " updated")
            } else {
              await createService(activeGroup.id, input)
              toast.success(input.name + " added")
            }
            setServiceDialog({ open: false, service: null })
          } catch (cause) {
            toast.error(errorMessage(cause))
          }
        }}
      />

      <ConfirmDeleteDialog
        open={!!deleteState?.open}
        onOpenChange={(open) => setDeleteState((state) => (state ? { ...state, open } : state))}
        title={deleteState?.kind === "group" ? "Delete this group?" : "Delete this service?"}
        description={
          deleteState?.kind === "group"
            ? "The group and every service inside it will be removed. This cannot be undone."
            : "The service will no longer be available to book. This cannot be undone."
        }
        pending={deleting}
        onConfirm={async () => {
          if (!deleteState || !activeGroup) return
          setDeleting(true)
          try {
            if (deleteState.kind === "group") {
              await deleteServiceGroup(activeGroup.id)
              toast.success("Group deleted")
            } else {
              await deleteService(activeGroup.id, deleteState.service.id)
              toast.success(deleteState.service.name + " deleted")
            }
            setDeleteState(null)
          } catch (cause) {
            toast.error(errorMessage(cause))
          } finally {
            setDeleting(false)
          }
        }}
      />
    </div>
  )
}

function ServicesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-72" />
      <Card>
        <CardHeader className="border-b">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 rounded-lg border p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
