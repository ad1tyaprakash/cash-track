import { DashboardCards } from "@/components/DashboardCards"
import { TransactionForm } from "@/components/TransactionForm"
import { TransactionsList } from "@/components/TransactionsList"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">Cash Track</h2>
              <p className="text-sm text-muted-foreground">
                Stay on top of your cash flow with quick insights.
              </p>
            </div>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Overview</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Analytics</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Budgets</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Accounts</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Banking</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Cards</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Savings</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 text-sm text-muted-foreground">
            Cash Track © {new Date().getFullYear()}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex flex-col">
            <header className="flex items-center gap-3 border-b px-6 py-4">
              <SidebarTrigger className="md:hidden" />
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  Welcome back
                </p>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Cash Track Dashboard
                </h1>
              </div>
            </header>

            <div className="space-y-8 px-6 py-6">
              <p className="text-muted-foreground">
                Monitor cash flow, review recent transactions, and capture new income or expenses in one place.
              </p>

              <DashboardCards />

              <Tabs defaultValue="transactions" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="add">Add Transaction</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>
                        Your latest activity across accounts.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TransactionsList />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="add" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add a new transaction</CardTitle>
                      <CardDescription>
                        Track incoming cash and expenses in seconds.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TransactionForm />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
