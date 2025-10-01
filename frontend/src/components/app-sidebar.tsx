"use client"

import * as React from "react"
import Image from "next/image"
import {
  BarChartIcon,
  CreditCardIcon,
  DollarSignIcon,
  LayoutDashboardIcon,
  PieChartIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react"
import { useTheme } from "next-themes"

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
      url: "/analytics",
      icon: BarChartIcon,
    },
    {
      title: "Investments",
      url: "/investments", 
      icon: TrendingUpIcon,
    },
    {
      title: "Budget",
      url: "/budget",
      icon: PieChartIcon,
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: CreditCardIcon,
    },
    {
      title: "Savings",
      url: "/savings",
      icon: WalletIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { theme } = useTheme()
  
  const sidebarUser = {
    name: user?.displayName ?? user?.email ?? "Cash Track User",
    email: user?.email ?? "user@cashtrack.com", 
    avatar: user?.photoURL ?? "/avatars/user.jpg",
  }

  // Determine which logo to show based on theme
  const getCurrentLogo = () => {
    const isDark = theme === 'dark'
    
    if (isDark) {
      return '/logos/logo-dark.png' // Your dark theme logo
    } else {
      return '/logos/logo-light.png' // Your light theme logo
    }
  }

  const currentLogo = getCurrentLogo()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-12 items-center justify-center rounded-lg overflow-hidden">
                <Image 
                  src={currentLogo} 
                  alt="Cash Track Logo" 
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to default icon if logo fails to load
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <div className="hidden flex aspect-square size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <DollarSignIcon className="size-6" />
                </div>
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
