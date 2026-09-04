"use client"

import * as React from "react"
import { CalendarIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
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
import { AppointmentDialog } from "@/components/appointments/appointment-dialog"
import { AppointmentRow } from "@/components/appointments/appointment-row"
import { ConfirmDeleteDialog } from "@/components/workshop/confirm-delete-dialog"
import { GroupDialog } from "@/components/workshop/group-dialog"
import { useDragReorder } from "@/components/workshop/use-drag-reorder"
import { toAppointmentInput } from "@/lib/workshop/data"
import { errorMessage, useWorkshop } from "@/lib/workshop/store"
import type { Appointment, AppointmentInput, Id } from "@/lib/workshop/types"

type GroupDialogState = { open: boolean; mode: "add" | "rename" }
type AppointmentDialogState = { open: boolean; appointment: Appointment | null }
type DeleteState =
  | { open: boolean; kind: "group" }
  | { open: boolean; kind: "appointment"; appointment: Appointment }

export function AppointmentsSection() {
  const {
    status,
    error,
    reload,
    usingMockApi,
    appointmentGroups,
    currencySymbol,
    createAppointmentGroup,
    renameAppointmentGroup,
    deleteAppointmentGroup,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    reorderAppointments,
  } = useWorkshop()

  const [activeGroupId, setActiveGroupId] = React.useState<Id>("")
  // Falls back to the first type when nothing is selected or the selection was deleted.
  const activeGroup =
    appointmentGroups.find((group) => group.id === activeGroupId) ?? appointmentGroups[0]

  const [groupDialog, setGroupDialog] = React.useState<GroupDialogState>({
    open: false,
    mode: "add",
  })
  const [appointmentDialog, setAppointmentDialog] = React.useState<AppointmentDialogState>({
    open: false,
    appointment: null,
  })
  const [deleteState, setDeleteState] = React.useState<DeleteState | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  /** Ids of appointments with a request in flight, so their row actions stay disabled. */
  const [busyIds, setBusyIds] = React.useState<Id[]>([])

  const withBusy = async (appointmentId: Id, run: () => Promise<void>) => {
    setBusyIds((ids) => [...ids, appointmentId])
    try {
      await run()
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setBusyIds((ids) => ids.filter((id) => id !== appointmentId))
    }
  }

  const appointments = React.useMemo(() => activeGroup?.appointments ?? [], [activeGroup])

  // Drag (or arrow-key) reordering; the store applies the order and reverts on failure.
  const reorder = useDragReorder(appointments, async (orderedIds) => {
    if (!activeGroup) return
    try {
      await reorderAppointments(activeGroup.id, orderedIds)
    } catch (cause) {
      toast.error(errorMessage(cause))
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em]">Appointments</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Create appointment types and add the appointments customers can book under each.
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

      {status === "loading" ? <AppointmentsSkeleton /> : null}

      {status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load appointments</AlertTitle>
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
          {/* Type selector */}
          <div className="flex flex-wrap items-center gap-2">
            {appointmentGroups.length ? (
              <Tabs value={activeGroup?.id ?? ""} onValueChange={setActiveGroupId}>
                <TabsList>
                  {appointmentGroups.map((group) => (
                    <TabsTrigger key={group.id} value={group.id} className="gap-2">
                      {group.name}
                      <Badge variant="secondary" className="px-1.5 tabular-nums">
                        {group.appointments.length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            ) : null}
            <Button variant="outline" onClick={() => setGroupDialog({ open: true, mode: "add" })}>
              <PlusIcon />
              Add type
            </Button>
          </div>

          {activeGroup ? (
            <Card>
              <CardHeader className="items-center border-b">
                <div className="flex items-center gap-2.5">
                  <CardTitle className="text-base">{activeGroup.name}</CardTitle>
                  <Badge variant="secondary">
                    {activeGroup.appointments.length}{" "}
                    {activeGroup.appointments.length === 1 ? "appointment" : "appointments"}
                  </Badge>
                </div>
                <CardDescription>
                  Appointments available under &ldquo;{activeGroup.name}&rdquo;
                </CardDescription>
                <CardAction className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Rename type"
                        onClick={() => setGroupDialog({ open: true, mode: "rename" })}
                      >
                        <PencilIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rename type</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete type"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteState({ open: true, kind: "group" })}
                      >
                        <Trash2Icon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete type</TooltipContent>
                  </Tooltip>
                </CardAction>
              </CardHeader>

              <CardContent>
                {/* Appointments sub-card */}
                <div className="overflow-hidden rounded-lg border">
                  <div className="flex items-start justify-between gap-4 border-b bg-muted/50 px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-semibold">Appointments</h2>
                        {appointments.length ? (
                          <Badge variant="secondary" className="tabular-nums">
                            {appointments.length}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        Offered to customers in this order when they book a slot.
                      </p>
                    </div>
                    <Button onClick={() => setAppointmentDialog({ open: true, appointment: null })}>
                      <PlusIcon />
                      Add appointment
                    </Button>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="px-6 py-11 text-center">
                      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <CalendarIcon className="size-5" />
                      </div>
                      <div className="text-sm font-semibold">No appointments yet</div>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        Add your first appointment under this type.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setAppointmentDialog({ open: true, appointment: null })}
                      >
                        <PlusIcon />
                        Add appointment
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {appointments.map((appointment, index) => (
                        <AppointmentRow
                          key={appointment.id}
                          appointment={appointment}
                          currencySymbol={currencySymbol}
                          busy={busyIds.includes(appointment.id)}
                          dragging={reorder.dragIndex === index}
                          dropTarget={reorder.overIndex === index}
                          dragHandleProps={reorder.handleProps(index)}
                          {...reorder.rowProps(index)}
                          onEdit={() => setAppointmentDialog({ open: true, appointment })}
                          onDuplicate={() =>
                            withBusy(appointment.id, async () => {
                              await createAppointment(activeGroup.id, {
                                ...toAppointmentInput(appointment),
                                name: appointment.name + " (copy)",
                              })
                              toast.success(appointment.name + " duplicated")
                            })
                          }
                          onDelete={() =>
                            setDeleteState({ open: true, kind: "appointment", appointment })
                          }
                          onToggleVisibility={() =>
                            withBusy(appointment.id, async () => {
                              await updateAppointment(appointment.id, activeGroup.id, {
                                ...toAppointmentInput(appointment),
                                disabled: !appointment.disabled,
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
                  <CalendarIcon className="size-5" />
                </div>
                <div className="text-sm font-semibold">No appointment types yet</div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Types organise the appointments customers can book.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setGroupDialog({ open: true, mode: "add" })}
                >
                  <PlusIcon />
                  Add type
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
        nounSingular="type"
        placeholder="e.g. Standard"
        onSubmit={async (name) => {
          if (groupDialog.mode === "add") {
            const group = await createAppointmentGroup(name)
            setActiveGroupId(group.id)
            toast.success(name + " type created")
          } else if (activeGroup) {
            await renameAppointmentGroup(activeGroup.id, name)
            toast.success("Type renamed")
          }
          setGroupDialog((state) => ({ ...state, open: false }))
        }}
      />

      <AppointmentDialog
        open={appointmentDialog.open}
        onOpenChange={(open) => setAppointmentDialog((state) => ({ ...state, open }))}
        appointment={appointmentDialog.appointment}
        onSave={async (input: AppointmentInput) => {
          if (!activeGroup) return
          try {
            if (appointmentDialog.appointment) {
              await updateAppointment(appointmentDialog.appointment.id, activeGroup.id, input)
              toast.success(input.name + " updated")
            } else {
              await createAppointment(activeGroup.id, input)
              toast.success(input.name + " added")
            }
            setAppointmentDialog({ open: false, appointment: null })
          } catch (cause) {
            toast.error(errorMessage(cause))
          }
        }}
      />

      <ConfirmDeleteDialog
        open={!!deleteState?.open}
        onOpenChange={(open) => setDeleteState((state) => (state ? { ...state, open } : state))}
        title={deleteState?.kind === "group" ? "Delete this type?" : "Delete this appointment?"}
        description={
          deleteState?.kind === "group"
            ? "The type and every appointment inside it will be removed. This cannot be undone."
            : "The appointment will no longer be available to book. This cannot be undone."
        }
        pending={deleting}
        onConfirm={async () => {
          if (!deleteState || !activeGroup) return
          setDeleting(true)
          try {
            if (deleteState.kind === "group") {
              await deleteAppointmentGroup(activeGroup.id)
              toast.success("Type deleted")
            } else {
              await deleteAppointment(activeGroup.id, deleteState.appointment.id)
              toast.success(deleteState.appointment.name + " deleted")
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

function AppointmentsSkeleton() {
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
