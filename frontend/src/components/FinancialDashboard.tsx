"use client"

import { useCallback, useMemo, useState, FormEvent, useEffect } from "react"
import {
  createExpense,
  createIncome,
  createStock,
  getDashboardOverview,
  type CreateExpensePayload,
  type CreateIncomePayload,
  type CreateStockPayload,
  type DashboardOverview,
  type StockOption,
} from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight, PlusCircle } from "lucide-react"
import { TransactionManager } from "./TransactionManager"
import { StockManager } from "./StockManager"

const EXPENSE_COLORS = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f"]
const NET_WORTH_COLORS = ["#2ca02c", "#d62728"]

function formatCurrency(amount: number): string {
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

interface FinancialDashboardProps {
  initialData?: DashboardOverview
}

export function FinancialDashboard({ initialData }: FinancialDashboardProps) {
  const [overview, setOverview] = useState(initialData || null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(!initialData)
  
  useEffect(() => {
    if (!initialData) {
      const fetchData = async () => {
        try {
          setIsLoading(true)
          const data = await getDashboardOverview()
          setOverview(data)
        } catch (error) {
          console.error("Failed to load dashboard overview", error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchData()
    }
  }, [initialData])
  const [incomeMessage, setIncomeMessage] = useState<string | null>(null)
  const [expenseMessage, setExpenseMessage] = useState<string | null>(null)
  const [stockMessage, setStockMessage] = useState<string | null>(null)
  const [incomeSubmitting, setIncomeSubmitting] = useState(false)
  const [expenseSubmitting, setExpenseSubmitting] = useState(false)
  const [stockSubmitting, setStockSubmitting] = useState(false)

  const [incomeForm, setIncomeForm] = useState({
    source: "",
    amount: "",
    date: "",
  })

  const [expenseForm, setExpenseForm] = useState({
    category: "",
    title: "",
    amount: "",
    date: "",
  })

  const [stockForm, setStockForm] = useState({
    ticker: "",
    quantity: "",
    purchase_price: "",
    current_price: "",
  })

  const refreshOverview = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const data = await getDashboardOverview()
      setOverview(data)
    } catch (error) {
      console.error("Failed to refresh dashboard overview", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleIncomeSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setIncomeSubmitting(true)
      setIncomeMessage(null)

      const amountValue = Number.parseFloat(incomeForm.amount)
      if (Number.isNaN(amountValue)) {
        setIncomeMessage("Enter a valid amount")
        setIncomeSubmitting(false)
        return
      }

      const payload: CreateIncomePayload = {
        source: incomeForm.source.trim(),
        amount: Math.abs(amountValue),
        date: incomeForm.date || undefined,
      }

      if (!payload.source) {
        setIncomeMessage("Source is required")
        setIncomeSubmitting(false)
        return
      }

      try {
        await createIncome(payload)
        setIncomeMessage("Income added successfully")
        setIncomeForm({ source: "", amount: "", date: "" })
        await refreshOverview()
      } catch (error) {
        console.error(error)
        setIncomeMessage(error instanceof Error ? error.message : "Failed to add income")
      } finally {
        setIncomeSubmitting(false)
      }
    },
    [incomeForm, refreshOverview]
  )

  const handleExpenseSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setExpenseSubmitting(true)
      setExpenseMessage(null)

      const amountValue = Number.parseFloat(expenseForm.amount)
      if (Number.isNaN(amountValue)) {
        setExpenseMessage("Enter a valid amount")
        setExpenseSubmitting(false)
        return
      }

      const payload: CreateExpensePayload = {
        category: expenseForm.category.trim(),
        amount: Math.abs(amountValue),
        title: expenseForm.title.trim() || undefined,
        date: expenseForm.date || undefined,
      }

      if (!payload.category) {
        setExpenseMessage("Category is required")
        setExpenseSubmitting(false)
        return
      }

      try {
        await createExpense(payload)
        setExpenseMessage("Expense added successfully")
        setExpenseForm({ category: "", title: "", amount: "", date: "" })
        await refreshOverview()
      } catch (error) {
        console.error(error)
        setExpenseMessage(error instanceof Error ? error.message : "Failed to add expense")
      } finally {
        setExpenseSubmitting(false)
      }
    },
    [expenseForm, refreshOverview]
  )

  const selectedStockOption = useMemo(() => {
    return overview.available_stocks.find((option) => option.symbol === stockForm.ticker)
  }, [overview.available_stocks, stockForm.ticker])

  const handleStockSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setStockSubmitting(true)
      setStockMessage(null)

      const quantityValue = Number.parseFloat(stockForm.quantity)
      const purchaseValue = Number.parseFloat(stockForm.purchase_price || "0")
      const currentValue = stockForm.current_price
        ? Number.parseFloat(stockForm.current_price)
        : undefined

      if (!stockForm.ticker) {
        setStockMessage("Choose a stock")
        setStockSubmitting(false)
        return
      }

      if (Number.isNaN(quantityValue) || quantityValue <= 0) {
        setStockMessage("Enter a valid quantity")
        setStockSubmitting(false)
        return
      }

      if (Number.isNaN(purchaseValue) || purchaseValue <= 0) {
        setStockMessage("Enter a valid purchase price")
        setStockSubmitting(false)
        return
      }

      const payload: CreateStockPayload = {
        ticker: stockForm.ticker,
        quantity: quantityValue,
        purchase_price: purchaseValue,
        current_price: currentValue && !Number.isNaN(currentValue) ? currentValue : undefined,
      }

      try {
        await createStock(payload)
        setStockMessage("Stock added successfully")
        setStockForm({ ticker: "", quantity: "", purchase_price: "", current_price: "" })
        await refreshOverview()
      } catch (error) {
        console.error(error)
        setStockMessage(error instanceof Error ? error.message : "Failed to add stock")
      } finally {
        setStockSubmitting(false)
      }
    },
    [stockForm, refreshOverview]
  )

  const expenseChartData = useMemo(() => {
    const labels = overview.expense_breakdown.labels
    const values = overview.expense_breakdown.data
    return labels.map((label, index) => ({
      name: label,
      value: Number(values[index] ?? 0),
    }))
  }, [overview.expense_breakdown])

  const netWorthChartData = useMemo(() => {
    const labels = overview.net_worth_breakdown.labels
    const values = overview.net_worth_breakdown.data
    return labels.map((label, index) => ({
      name: label,
      value: Number(values[index] ?? 0),
    }))
  }, [overview.net_worth_breakdown])

  const hasExpenseData = expenseChartData.some((item) => item.value > 0)
  const hasNetWorthData = netWorthChartData.some((item) => item.value > 0)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading dashboard data...
        </div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          We couldn&apos;t load your dashboard data right now. Please try refreshing the page.
        </div>
      </div>
    )
  }

  const deficitIsPositive = overview.deficit >= 0

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 lg:px-6">
      {/* Cards Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Net Worth</CardTitle>
            <CardDescription>Overview of your assets and savings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-semibold">
              {formatCurrency(overview.total_net_worth)}
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Stocks</span>
                <span>{formatCurrency(overview.net_worth)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Savings</span>
                <span>{formatCurrency(overview.total_savings)}</span>
              </div>
            </div>
            <form className="grid gap-3" onSubmit={handleIncomeSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="income-source">Income source</Label>
                <Input
                  id="income-source"
                  placeholder="Salary, bonus, etc."
                  value={incomeForm.source}
                  onChange={(event) =>
                    setIncomeForm((state) => ({ ...state, source: event.target.value }))
                  }
                  disabled={incomeSubmitting || isRefreshing}
                  required
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="income-amount">Amount</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={incomeForm.amount}
                    onChange={(event) =>
                      setIncomeForm((state) => ({ ...state, amount: event.target.value }))
                    }
                    disabled={incomeSubmitting || isRefreshing}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="income-date">Date</Label>
                  <Input
                    id="income-date"
                    type="date"
                    value={incomeForm.date}
                    onChange={(event) =>
                      setIncomeForm((state) => ({ ...state, date: event.target.value }))
                    }
                    disabled={incomeSubmitting || isRefreshing}
                  />
                </div>
              </div>
              <Button type="submit" disabled={incomeSubmitting || isRefreshing}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {incomeSubmitting ? "Adding..." : "Add Income"}
              </Button>
            </form>
          </CardContent>
          {incomeMessage && (
            <CardFooter>
              <Badge variant={incomeMessage.includes("successfully") ? "default" : "destructive"}>
                {incomeMessage}
              </Badge>
            </CardFooter>
          )}
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Deficit / Surplus</CardTitle>
            <CardDescription>Track your spending against income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={cn(
                "flex items-center gap-2 text-4xl font-semibold",
                deficitIsPositive ? "text-emerald-600" : "text-red-600"
              )}
            >
              {deficitIsPositive ? <ArrowUpRight className="h-8 w-8" /> : <ArrowDownRight className="h-8 w-8" />}
              {formatCurrency(Math.abs(overview.deficit))}
            </div>
            <form className="grid gap-3" onSubmit={handleExpenseSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="expense-category">Category</Label>
                <Input
                  id="expense-category"
                  placeholder="Food, Rent, Utilities..."
                  value={expenseForm.category}
                  onChange={(event) =>
                    setExpenseForm((state) => ({ ...state, category: event.target.value }))
                  }
                  disabled={expenseSubmitting || isRefreshing}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expense-title">Description</Label>
                <Input
                  id="expense-title"
                  placeholder="Optional description"
                  value={expenseForm.title}
                  onChange={(event) =>
                    setExpenseForm((state) => ({ ...state, title: event.target.value }))
                  }
                  disabled={expenseSubmitting || isRefreshing}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(event) =>
                      setExpenseForm((state) => ({ ...state, amount: event.target.value }))
                    }
                    disabled={expenseSubmitting || isRefreshing}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expense-date">Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={expenseForm.date}
                    onChange={(event) =>
                      setExpenseForm((state) => ({ ...state, date: event.target.value }))
                    }
                    disabled={expenseSubmitting || isRefreshing}
                  />
                </div>
              </div>
              <Button type="submit" disabled={expenseSubmitting || isRefreshing} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                {expenseSubmitting ? "Adding..." : "Add Expense"}
              </Button>
            </form>
          </CardContent>
          {expenseMessage && (
            <CardFooter>
              <Badge variant={expenseMessage.includes("successfully") ? "default" : "destructive"}>
                {expenseMessage}
              </Badge>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Distribution of your recent expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {hasExpenseData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={4}
                  >
                    {expenseChartData.map((_, index) => (
                      <Cell
                        key={`expense-${index}`}
                        fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                No expense data to show.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Net Worth (Assets vs Liabilities)</CardTitle>
            <CardDescription>Snapshot of assets and liabilities</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {hasNetWorthData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={netWorthChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {netWorthChartData.map((_, index) => (
                      <Cell
                        key={`networth-${index}`}
                        fill={NET_WORTH_COLORS[index % NET_WORTH_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                No net worth data to show.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Stocks</CardTitle>
          <CardDescription>Current positions and performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {overview.stock_data.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No stock positions yet. Add your first investment below.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Buy</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.stock_data.map((stock) => (
                    <TableRow key={`${stock.ticker}-${stock.purchase_price}-${stock.quantity}`}>
                      <TableCell className="font-medium">{stock.ticker}</TableCell>
                      <TableCell>{stock.quantity}</TableCell>
                      <TableCell>{formatCurrency(stock.purchase_price)}</TableCell>
                      <TableCell>{formatCurrency(stock.current_price)}</TableCell>
                      <TableCell>{formatCurrency(stock.current_value)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            stock.profit >= 0 ? "text-emerald-600" : "text-red-600",
                            "font-medium"
                          )}
                        >
                          {formatCurrency(stock.profit)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <form className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:items-end" onSubmit={handleStockSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="stock-ticker">Ticker</Label>
              <Select
                value={stockForm.ticker}
                onValueChange={(value) =>
                  setStockForm((state) => ({ ...state, ticker: value, current_price: "" }))
                }
                disabled={stockSubmitting || isRefreshing || overview.available_stocks.length === 0}
              >
                <SelectTrigger id="stock-ticker">
                  <SelectValue placeholder="Select a stock" />
                </SelectTrigger>
                <SelectContent>
                  {overview.available_stocks.map((option: StockOption) => (
                    <SelectItem key={option.symbol} value={option.symbol}>
                      {option.symbol} — {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock-quantity">Quantity</Label>
              <Input
                id="stock-quantity"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={stockForm.quantity}
                onChange={(event) =>
                  setStockForm((state) => ({ ...state, quantity: event.target.value }))
                }
                disabled={stockSubmitting || isRefreshing}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock-purchase">Purchase price</Label>
              <Input
                id="stock-purchase"
                type="number"
                step="0.01"
                min="0"
                placeholder={selectedStockOption ? selectedStockOption.price.toString() : "0.00"}
                value={stockForm.purchase_price}
                onChange={(event) =>
                  setStockForm((state) => ({ ...state, purchase_price: event.target.value }))
                }
                disabled={stockSubmitting || isRefreshing}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock-current">Current price (optional)</Label>
              <Input
                id="stock-current"
                type="number"
                step="0.01"
                min="0"
                placeholder={selectedStockOption ? selectedStockOption.price.toString() : "0.00"}
                value={stockForm.current_price}
                onChange={(event) =>
                  setStockForm((state) => ({ ...state, current_price: event.target.value }))
                }
                disabled={stockSubmitting || isRefreshing}
              />
            </div>
            <div className="lg:col-span-4">
              <Button type="submit" disabled={stockSubmitting || isRefreshing} className="w-full lg:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                {stockSubmitting ? "Adding..." : "Add Stock"}
              </Button>
            </div>
          </form>
          {stockMessage && (
            <CardFooter className="px-0">
              <Badge variant={stockMessage.includes("successfully") ? "default" : "destructive"}>
                {stockMessage}
              </Badge>
            </CardFooter>
          )}
        </CardContent>
      </Card>

      {/* Management Components */}
      <div className="grid gap-6 lg:grid-cols-1">
        <StockManager 
          stocks={overview.stock_data} 
          onStockDeleted={refreshOverview}
        />
        <TransactionManager />
      </div>
    </div>
  )
}