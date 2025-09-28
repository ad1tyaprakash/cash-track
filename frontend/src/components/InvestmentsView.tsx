"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  PlusCircle,
  DollarSign,
  BarChart3,
  PieChart,
  Target
} from "lucide-react"
import { getDashboardOverview, type DashboardOverview, type StockEntry } from "@/lib/api"
import { StockManager } from "@/components/StockManager"
import { 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"

const STOCK_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

interface InvestmentsViewProps {
  initialData: DashboardOverview
}

export function InvestmentsView({ initialData }: InvestmentsViewProps) {
  const [overview, setOverview] = useState(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const data = await getDashboardOverview()
      setOverview(data)
    } catch (error) {
      console.error("Failed to refresh investment data", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Calculate investment metrics
  const totalInvestmentValue = overview.stock_data.reduce((sum, stock) => sum + stock.current_value, 0)
  const totalCostBasis = overview.stock_data.reduce((sum, stock) => sum + (stock.quantity * stock.purchase_price), 0)
  const totalGainLoss = totalInvestmentValue - totalCostBasis
  const totalReturnPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0

  // Prepare data for charts
  const portfolioComposition = overview.stock_data.map((stock, index) => ({
    name: stock.ticker,
    value: stock.current_value,
    percentage: totalInvestmentValue > 0 ? (stock.current_value / totalInvestmentValue * 100) : 0,
    fill: STOCK_COLORS[index % STOCK_COLORS.length]
  }))

  const performanceData = overview.stock_data.map(stock => ({
    ticker: stock.ticker,
    profit: stock.profit,
    profitPercent: ((stock.profit / (stock.quantity * stock.purchase_price)) * 100),
    currentValue: stock.current_value
  }))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  const getBestPerformer = () => {
    if (overview.stock_data.length === 0) return null
    return overview.stock_data.reduce((best, current) => 
      current.profit > best.profit ? current : best
    )
  }

  const getWorstPerformer = () => {
    if (overview.stock_data.length === 0) return null
    return overview.stock_data.reduce((worst, current) => 
      current.profit < worst.profit ? current : worst
    )
  }

  const bestPerformer = getBestPerformer()
  const worstPerformer = getWorstPerformer()

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
          <p className="text-muted-foreground">Track and manage your investment portfolio</p>
        </div>
        <Button
          variant="outline"
          onClick={refreshData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestmentValue)}</div>
            <p className="text-xs text-muted-foreground">
              Current portfolio value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalGainLoss)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(totalReturnPercent)} total return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.stock_data.length}</div>
            <p className="text-xs text-muted-foreground">
              Active investments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Basis</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCostBasis)}</div>
            <p className="text-xs text-muted-foreground">
              Total invested amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Highlights */}
      {overview.stock_data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Best Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bestPerformer && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{bestPerformer.ticker}</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {formatPercent((bestPerformer.profit / (bestPerformer.quantity * bestPerformer.purchase_price)) * 100)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Gain: <span className="text-green-600 font-medium">{formatCurrency(bestPerformer.profit)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Value: <span className="font-medium">{formatCurrency(bestPerformer.current_value)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Worst Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {worstPerformer && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{worstPerformer.ticker}</span>
                    <Badge variant="destructive">
                      {formatPercent((worstPerformer.profit / (worstPerformer.quantity * worstPerformer.purchase_price)) * 100)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Loss: <span className="text-red-600 font-medium">{formatCurrency(worstPerformer.profit)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Value: <span className="font-medium">{formatCurrency(worstPerformer.current_value)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Portfolio Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Portfolio Composition
            </CardTitle>
            <CardDescription>Allocation by current value</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {portfolioComposition.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={portfolioComposition}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }: any) => `${name} (${percentage.toFixed(1)}%)`}
                  >
                    {portfolioComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No investment data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Overview
            </CardTitle>
            <CardDescription>Profit/Loss by position</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ticker" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === 'profit' ? 'Profit/Loss' : name
                    ]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar 
                    dataKey="profit" 
                    name="Profit/Loss"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Investment Management */}
      <StockManager 
        stocks={overview.stock_data} 
        onStockDeleted={refreshData}
      />
    </div>
  )
}