"use client"

import * as React from "react"
import { PencilIcon, PlusIcon, Trash2Icon, WrenchIcon } from "lucide-react"
import { toast } from "sonner"

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ConfirmDeleteDialog } from "@/components/services/confirm-delete-dialog"
import { GroupDialog } from "@/components/services/group-dialog"
import { ServiceDialog } from "@/components/services/service-dialog"
import { ServiceRow } from "@/components/services/service-row"
import { useWorkshop } from "@/lib/workshop/store"
import type { Service } from "@/lib/workshop/types"

type GroupDialogState = { open: boolean; mode: "add" | "rename" }
type ServiceDialogState = { open: boolean; service: Service | null }
type DeleteState =
  { open: boolean; kind: "group" } | { open: boolean; kind: "service"; service: Service }

export function ServicesSection() {
  const {
    serviceGroups,
    currencySymbol,
    addServiceGroup,
    renameServiceGroup,
    deleteServiceGroup,
    saveService,
    deleteService,
    duplicateService,
    toggleServiceVisibility,
  } = useWorkshop()

  const [activeGroupId, setActiveGroupId] = React.useState(serviceGroups[0]?.id ?? "")
  // Falls back to the first group when the selected one has been deleted.
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

      {/* Group selector */}
      <div className="flex flex-wrap items-center gap-2">
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
                      onEdit={() => setServiceDialog({ open: true, service })}
                      onDuplicate={() => {
                        duplicateService(activeGroup.id, service.id)
                        toast.success(service.name + " duplicated")
                      }}
                      onDelete={() => setDeleteState({ open: true, kind: "service", service })}
                      onToggleVisibility={() => toggleServiceVisibility(activeGroup.id, service.id)}
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
            <Button className="mt-4" onClick={() => setGroupDialog({ open: true, mode: "add" })}>
              <PlusIcon />
              Add group
            </Button>
          </CardContent>
        </Card>
      )}

      <GroupDialog
        open={groupDialog.open}
        onOpenChange={(open) => setGroupDialog((state) => ({ ...state, open }))}
        initialName={groupDialog.mode === "rename" ? (activeGroup?.name ?? "") : null}
        onSubmit={(name) => {
          if (groupDialog.mode === "add") {
            setActiveGroupId(addServiceGroup(name))
            toast.success(name + " group created")
          } else if (activeGroup) {
            renameServiceGroup(activeGroup.id, name)
            toast.success("Group renamed")
          }
          setGroupDialog((state) => ({ ...state, open: false }))
        }}
      />

      <ServiceDialog
        open={serviceDialog.open}
        onOpenChange={(open) => setServiceDialog((state) => ({ ...state, open }))}
        service={serviceDialog.service}
        onSave={(service) => {
          if (!activeGroup) return
          saveService(activeGroup.id, service)
          toast.success(serviceDialog.service ? service.name + " updated" : service.name + " added")
          setServiceDialog({ open: false, service: null })
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
        onConfirm={() => {
          if (!deleteState || !activeGroup) return
          if (deleteState.kind === "group") {
            deleteServiceGroup(activeGroup.id)
            toast.success("Group deleted")
          } else {
            deleteService(activeGroup.id, deleteState.service.id)
            toast.success(deleteState.service.name + " deleted")
          }
          setDeleteState(null)
        }}
      />
    </div>
  )
}
