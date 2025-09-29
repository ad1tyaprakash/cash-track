'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { FinancialDashboard } from "@/components/FinancialDashboard"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <FinancialDashboard />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}