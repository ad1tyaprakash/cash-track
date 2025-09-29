'use client'

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getDashboardOverview, type DashboardOverview } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

function AnalyticsContent({ overview }: { overview: DashboardOverview }) {
  // Create monthly trends data (mock for now)
  const monthlyTrends = [
    { month: 'Jan', income: 5000, expenses: 3500, savings: 1500 },
    { month: 'Feb', income: 5200, expenses: 3800, savings: 1400 },
    { month: 'Mar', income: 4800, expenses: 3200, savings: 1600 },
    { month: 'Apr', income: 5500, expenses: 4000, savings: 1500 },
    { month: 'May', income: 5300, expenses: 3600, savings: 1700 },
    { month: 'Jun', income: 5600, expenses: 3900, savings: 1700 },
  ]

  // Create category breakdown from expense data
  const categoryData = overview.expense_breakdown.labels.map((label, index) => ({
    name: label,
    value: overview.expense_breakdown.data[index],
  }))

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your financial patterns</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.total_net_worth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {overview.deficit >= 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Surplus: ${overview.deficit.toFixed(2)}
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Deficit: ${Math.abs(overview.deficit).toFixed(2)}
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investment Portfolio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${overview.stock_data.reduce((sum, stock) => sum + stock.current_value, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total Profit: ${overview.stock_data.reduce((sum, stock) => sum + stock.profit, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.total_savings > 0 ? ((overview.total_savings / overview.net_worth) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Total Savings: ${overview.total_savings.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Count</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.stock_data.length}</div>
            <p className="text-xs text-muted-foreground">Active investments</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Income, expenses, and savings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#8884d8" name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
                <Line type="monotone" dataKey="savings" stroke="#ffc658" name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Net Worth Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Net Worth Breakdown</CardTitle>
          <CardDescription>Distribution of your assets</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overview.net_worth_breakdown.labels.map((label, index) => ({
              name: label,
              value: overview.net_worth_breakdown.data[index],
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getDashboardOverview()
        setOverview(data)
      } catch (error) {
        console.error("Failed to load analytics data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center px-4 pb-10">
              <div className="w-full max-w-md rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Loading analytics data...
              </div>
            </div>
          ) : overview ? (
            <AnalyticsContent overview={overview} />
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 pb-10">
              <div className="w-full max-w-md rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                We couldn&apos;t load your analytics data right now. Please try refreshing the page.
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}