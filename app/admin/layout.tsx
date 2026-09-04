import { MountainSnowIcon } from "lucide-react"

import { AdminNav } from "@/components/admin/admin-nav"
import { TooltipProvider } from "@/components/ui/tooltip"
import { WorkshopProvider } from "@/lib/workshop/store"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkshopProvider>
      <TooltipProvider>
        <div className="min-h-svh bg-[#fafafa]">
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="mx-auto flex h-[60px] w-full max-w-[1040px] items-center gap-2.5 px-8">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <MountainSnowIcon className="size-4" />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.01em]">Alpine Werks</span>
            </div>
            <AdminNav />
          </header>
          <main className="mx-auto w-full max-w-[1040px] px-8 pt-7 pb-16">{children}</main>
        </div>
      </TooltipProvider>
    </WorkshopProvider>
  )
}
