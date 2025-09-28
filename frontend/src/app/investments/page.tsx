import { AppSidebar } from "@/components/app-sidebar"
import { InvestmentsView } from "@/components/InvestmentsView"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getDashboardOverview, type DashboardOverview } from "@/lib/api"

async function fetchOverview(): Promise<DashboardOverview | null> {
  try {
    return await getDashboardOverview()
  } catch (error) {
    console.error("Failed to load dashboard overview", error)
    return null
  }
}

export default async function InvestmentsPage() {
  const overview = await fetchOverview()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          {overview ? (
            <InvestmentsView initialData={overview} />
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 pb-10">
              <div className="w-full max-w-md rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                We couldn&apos;t load your investment data right now. Please try refreshing the page.
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}