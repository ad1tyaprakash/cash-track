'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { FinancialDashboard } from "@/components/FinancialDashboard"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute requirePassword={true}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <FinancialDashboard />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}