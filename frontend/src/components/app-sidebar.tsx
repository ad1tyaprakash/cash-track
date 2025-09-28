"use client"

import * as React from "react"
import {
  BarChartIcon,
  CreditCardIcon,
  DollarSignIcon,
  LayoutDashboardIcon,
  PieChartIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-provider"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      isActive: true,
    },
    {
      title: "Analytics", 
      url: "#",
      icon: BarChartIcon,
    },
    {
      title: "Investments",
      url: "#", 
      icon: TrendingUpIcon,
    },
    {
      title: "Budget",
      url: "#",
      icon: PieChartIcon,
    },
    {
      title: "Accounts",
      url: "#",
      icon: CreditCardIcon,
    },
    {
      title: "Savings",
      url: "#",
      icon: WalletIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const sidebarUser = {
    name: user?.displayName ?? user?.email ?? "Cash Track User",
    email: user?.email ?? "user@cashtrack.com", 
    avatar: user?.photoURL ?? "/avatars/user.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <DollarSignIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Cash Track</span>
                <span className="truncate text-xs">Financial Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
