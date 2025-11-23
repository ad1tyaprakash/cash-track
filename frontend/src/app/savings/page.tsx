'use client'

import { useEffect, useState, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getDashboardOverview, getSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal, type DashboardOverview, type SavingsGoal, type CreateSavingsGoalPayload } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlusCircle, Target, Calendar, TrendingUp, Coins } from "lucide-react"

function SavingsContent({ overview, initialGoals }: { overview: DashboardOverview, initialGoals: SavingsGoal[] }) {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialGoals)
  const [loadingGoals, setLoadingGoals] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newGoal, setNewGoal] = useState({ 
    name: '', 
    target: '', 
    deadline: '',
    category: 'Other'
  })

  useEffect(() => {
    setSavingsGoals(initialGoals)
  }, [initialGoals])

  const refreshGoals = async () => {
    try {
      setLoadingGoals(true)
      setError(null)
      const goals = await getSavingsGoals()
      setSavingsGoals(goals)
    } catch (err) {
      console.error('Failed to fetch savings goals', err)
      setError('Unable to load savings goals right now.')
    } finally {
      setLoadingGoals(false)
    }
  }

  const totalSavingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.target_amount, 0)
  const totalSavedAmount = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0)
  const averageProgress = (totalSavedAmount / totalSavingsTarget) * 100

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-red-50'
      case 'medium': return 'bg-yellow-500 text-yellow-50'
      case 'low': return 'bg-green-500 text-green-50'
      default: return 'bg-gray-500 text-gray-50'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Emergency': return '🚨'
      case 'Travel': return '✈️'
      case 'Transportation': return '🚗'
      case 'Home': return '🏠'
      case 'Education': return '🎓'
      case 'Investment': return '📈'
      default: return '💰'
    }
  }

  const addSavingsGoal = async () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      setError('Please fill in all fields before creating a goal.')
      return
    }

    const payload: CreateSavingsGoalPayload = {
      name: newGoal.name,
      target_amount: parseFloat(newGoal.target),
      deadline: newGoal.deadline,
      category: newGoal.category,
    }

    if (Number.isNaN(payload.target_amount) || payload.target_amount <= 0) {
      setError('Target amount must be greater than 0.')
      return
    }

    try {
      setError(null)
      await createSavingsGoal(payload)
      await refreshGoals()
      setNewGoal({ name: '', target: '', deadline: '', category: 'Other' })
    } catch (err) {
      console.error('Failed to create savings goal', err)
      setError('Failed to create savings goal. Please try again.')
    }
  }

  const getTimeRemaining = (deadline: string) => {
    const today = new Date()
    const target = new Date(deadline)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' }
    if (diffDays === 0) return { text: 'Today', color: 'text-red-600' }
    if (diffDays === 1) return { text: '1 day left', color: 'text-yellow-600' }
    if (diffDays < 30) return { text: `${diffDays} days left`, color: 'text-yellow-600' }
    if (diffDays < 90) return { text: `${Math.ceil(diffDays/30)} months left`, color: 'text-blue-600' }
    return { text: `${Math.ceil(diffDays/365)} years left`, color: 'text-green-600' }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Savings Goals</h1>
          <p className="text-muted-foreground">Track your progress towards financial goals</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Savings Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.total_savings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSavedAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              of ${totalSavingsTarget.toFixed(2)} target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savingsGoals.length}</div>
            <p className="text-xs text-muted-foreground">Goals to complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {savingsGoals.map((goal) => {
          const progress = (goal.current_amount / goal.target_amount) * 100
          const timeRemaining = getTimeRemaining(goal.deadline)
          
          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                    <div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      <CardDescription>{goal.category}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(goal.priority)}>
                    {goal.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>${goal.current_amount.toFixed(2)} saved</span>
                    <span>${goal.target_amount.toFixed(2)} target</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{progress.toFixed(1)}% complete</span>
                    <span>${(goal.target_amount - goal.current_amount).toFixed(2)} remaining</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                  <span className={`text-sm font-medium ${timeRemaining.color}`}>
                    {timeRemaining.text}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => updateSavingsGoal(goal.id, { current_amount: goal.current_amount + 100 })}>
                    +$100
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => deleteSavingsGoal(goal.id).then(refreshGoals)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add New Goal */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Savings Goal</CardTitle>
            <CardDescription>Set a new financial target to work towards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input
                id="goal-name"
                placeholder="e.g., Emergency Fund"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-amount">Target Amount</Label>
              <Input
                id="target-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Target Date</Label>
              <Input
                id="deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-category">Category</Label>
              <select
                id="goal-category"
                title="Goal Category"
                className="w-full p-2 border rounded-md"
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              >
                <option value="Emergency">Emergency Fund</option>
                <option value="Travel">Travel</option>
                <option value="Transportation">Transportation</option>
                <option value="Home">Home</option>
                <option value="Education">Education</option>
                <option value="Investment">Investment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Button onClick={addSavingsGoal} className="w-full" disabled={loadingGoals}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {loadingGoals ? 'Saving...' : 'Create Goal'}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Tips</CardTitle>
            <CardDescription>Strategies to reach your goals faster</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">🎯 Set SMART Goals</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Make goals Specific, Measurable, Achievable, Relevant, and Time-bound
                </p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100">💰 Automate Savings</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Set up automatic transfers to save consistently without thinking
                </p>
              </div>
              
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">📊 Track Progress</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Review your goals monthly and celebrate milestones
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-100">🔄 Start Small</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Begin with achievable amounts and increase gradually
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Summary</CardTitle>
          <CardDescription>Overview of your savings progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalSavedAmount.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Total Saved</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${totalSavingsTarget.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Total Target</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${(totalSavingsTarget - totalSavedAmount).toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={averageProgress} className="h-4" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              {averageProgress.toFixed(1)}% of all goals completed
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SavingsPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getDashboardOverview()
        setOverview(data)
      } catch (error) {
        console.error("Failed to load savings data", error)
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
                Loading savings data...
              </div>
            </div>
          ) : overview ? (
            <SavingsContent overview={overview} initialGoals={overview.savings_goals} />
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 pb-10">
              <div className="w-full max-w-md rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                We couldn&apos;t load your savings data right now. Please try refreshing the page.
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}