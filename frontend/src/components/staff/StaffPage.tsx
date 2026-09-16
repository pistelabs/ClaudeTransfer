import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/PageHeader"
import { StaffCard } from "./StaffCard"
import { StaffDetailsDialog } from "./StaffDetailsDialog"
import {
  StaffFormDialog,
  draftFromStaff,
  newStaffDraft,
  type StaffDraft,
} from "./StaffFormDialog"
import { AnnualLeaveTable } from "./AnnualLeaveTable"
import { AddLeaveDialog } from "./AddLeaveDialog"
import {
  useCreateLeave,
  useCreateStaff,
  useDeleteLeave,
  useDeleteStaff,
  useLeave,
  useStaff,
  useUpdateStaff,
} from "@/lib/api/queries"
import type { StaffMember } from "@/lib/types"

export function StaffPage() {
  const [details, setDetails] = useState<StaffMember | null>(null)
  const [draft, setDraft] = useState<StaffDraft | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)

  const { data: staff = [], isLoading } = useStaff()
  const { data: leave = [] } = useLeave()

  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()
  const deleteStaff = useDeleteStaff()
  const createLeave = useCreateLeave()
  const deleteLeave = useDeleteLeave()

  function handleSave(
    value: StaffDraft,
    input: Parameters<typeof createStaff.mutate>[0],
  ) {
    if (value.id) {
      updateStaff.mutate(
        { id: value.id, input },
        {
          onSuccess: () => {
            toast.success("Staff member updated", { description: value.name })
            setDraft(null)
          },
        },
      )
      return
    }
    createStaff.mutate(input, {
      onSuccess: () => {
        toast.success("Staff member added", { description: value.name })
        setDraft(null)
      },
    })
  }

  function handleDelete(member: StaffMember) {
    deleteStaff.mutate(member.id, {
      onSuccess: () =>
        toast.success("Staff member removed", { description: member.name }),
    })
  }

  return (
    <div>
      <PageHeader
        title="Staff Members"
        subtitle="Manage your team, roles, and contact details."
        actions={
          <Button onClick={() => setDraft(newStaffDraft())}>
            <PlusIcon /> Add staff
          </Button>
        }
      />

      {isLoading ? (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[168px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              staff={member}
              onOpen={() => setDetails(member)}
              onEdit={() => setDraft(draftFromStaff(member))}
              onDelete={() => handleDelete(member)}
            />
          ))}
        </div>
      )}

      <div className="mt-[34px] mb-4 flex items-center justify-between gap-4">
        <h2 className="font-heading text-[17px] font-bold tracking-[-0.2px]">
          Annual Leave
        </h2>
        <Button variant="outline" onClick={() => setLeaveOpen(true)}>
          <PlusIcon /> Add Annual Leave
        </Button>
      </div>

      <AnnualLeaveTable
        leave={leave}
        staff={staff}
        onDelete={(entry) =>
          deleteLeave.mutate(entry.id, {
            onSuccess: () => toast.success("Annual leave removed"),
          })
        }
      />

      <StaffDetailsDialog
        staff={details}
        onOpenChange={(open) => !open && setDetails(null)}
        onEdit={(member) => {
          setDetails(null)
          setDraft(draftFromStaff(member))
        }}
      />

      {draft && (
        <StaffFormDialog
          // Remount per opened record so the draft state starts fresh.
          key={draft.id ?? "new"}
          draft={draft}
          onOpenChange={(open) => !open && setDraft(null)}
          onSave={handleSave}
          saving={createStaff.isPending || updateStaff.isPending}
        />
      )}

      {leaveOpen && (
        <AddLeaveDialog
          staff={staff}
          onOpenChange={setLeaveOpen}
          saving={createLeave.isPending}
          onSave={(input) =>
            createLeave.mutate(input, {
              onSuccess: (entry) => {
                toast.success("Annual leave added", {
                  description: entry.dates,
                })
                setLeaveOpen(false)
              },
            })
          }
        />
      )}
    </div>
  )
}
