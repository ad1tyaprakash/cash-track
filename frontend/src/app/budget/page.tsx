'use client'

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getDashboardOverview, type DashboardOverview } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Target, AlertTriangle, CheckCircle } from "lucide-react"

function BudgetContent({ overview }: { overview: DashboardOverview }) {
  const [budgets, setBudgets] = useState([
    { id: 1, category: 'Food & Dining', budget: 800, spent: 650, color: 'bg-blue-500' },
    { id: 2, category: 'Transportation', budget: 400, spent: 320, color: 'bg-green-500' },
    { id: 3, category: 'Entertainment', budget: 300, spent: 280, color: 'bg-yellow-500' },
    { id: 4, category: 'Shopping', budget: 500, spent: 620, color: 'bg-red-500' },
    { id: 5, category: 'Utilities', budget: 200, spent: 180, color: 'bg-purple-500' },
  ])

  const [newBudget, setNewBudget] = useState({ category: '', amount: '' })

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const remainingBudget = totalBudget - totalSpent

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return { status: 'Over Budget', color: 'text-red-600', icon: AlertTriangle }
    if (percentage >= 80) return { status: 'Almost Full', color: 'text-yellow-600', icon: AlertTriangle }
    return { status: 'On Track', color: 'text-green-600', icon: CheckCircle }
  }

  const addBudget = () => {
    if (newBudget.category && newBudget.amount) {
      const budget = {
        id: budgets.length + 1,
        category: newBudget.category,
        budget: parseFloat(newBudget.amount),
        spent: 0,
        color: `bg-${['blue', 'green', 'yellow', 'red', 'purple', 'pink'][budgets.length % 6]}-500`
      }
      setBudgets([...budgets, budget])
      setNewBudget({ category: '', amount: '' })
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget</h1>
          <p className="text-muted-foreground">Track your spending against your budget goals</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Monthly allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(remainingBudget).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {remainingBudget >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>Track spending by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.budget) * 100
              const { status, color, icon: Icon } = getBudgetStatus(budget.spent, budget.budget)
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${budget.color}`} />
                      <span className="font-medium">{budget.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={color}>
                        <Icon className="mr-1 h-3 w-3" />
                        {status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>${budget.spent.toFixed(2)} of ${budget.budget.toFixed(2)}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                    // @ts-ignore
                    style={{ '--progress-background': percentage > 100 ? '#ef4444' : undefined }}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Budget</CardTitle>
            <CardDescription>Create a budget for a new category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Groceries, Rent, etc."
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monthly Budget</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newBudget.amount}
                onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
              />
            </div>
            <Button onClick={addBudget} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Budget
            </Button>

            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Budget Tips</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</p>
                <p>• Review and adjust budgets monthly</p>
                <p>• Set realistic spending limits</p>
                <p>• Track expenses regularly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual Spending */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget Overview</CardTitle>
          <CardDescription>Compare your planned vs actual spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Planned Budget</p>
                <p className="text-2xl font-bold text-blue-600">${totalBudget.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Actual Spending</p>
                <p className={`text-2xl font-bold ${totalSpent > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
            <Progress 
              value={(totalSpent / totalBudget) * 100} 
              className="h-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BudgetPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getDashboardOverview()
        setOverview(data)
      } catch (error) {
        console.error("Failed to load budget data", error)
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
                Loading budget data...
              </div>
            </div>
          ) : overview ? (
            <BudgetContent overview={overview} />
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 pb-10">
              <div className="w-full max-w-md rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                We couldn&apos;t load your budget data right now. Please try refreshing the page.
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}