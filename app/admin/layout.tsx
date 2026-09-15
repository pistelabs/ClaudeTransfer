import { AdminNav } from "@/components/admin/admin-nav"
import { AppBarBrand } from "@/components/admin/app-bar-brand"
import { TooltipProvider } from "@/components/ui/tooltip"
import { WorkshopProvider } from "@/lib/workshop/store"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkshopProvider>
      <TooltipProvider>
        <div className="min-h-svh bg-[#fafafa]">
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="mx-auto flex h-[60px] w-full max-w-[1040px] items-center gap-2.5 px-8">
              <AppBarBrand />
            </div>
            <AdminNav />
          </header>
          <main className="mx-auto w-full max-w-[1040px] px-8 pt-7 pb-16">{children}</main>
        </div>
      </TooltipProvider>
    </WorkshopProvider>
  )
}
