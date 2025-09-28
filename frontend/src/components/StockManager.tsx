"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { deleteStock, type StockEntry } from "@/lib/api"
import { toast } from "sonner"

interface StockManagerProps {
  stocks: StockEntry[]
  onStockDeleted: () => void
}

export function StockManager({ stocks, onStockDeleted }: StockManagerProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = useCallback(async (ticker: string) => {
    if (!confirm(`Are you sure you want to delete ${ticker} position?`)) {
      return
    }

    try {
      setDeleting(ticker)
      await deleteStock(ticker)
      onStockDeleted()
      toast.success(`${ticker} position deleted successfully`)
    } catch (error) {
      toast.error("Failed to delete stock position")
      console.error("Failed to delete stock:", error)
    } finally {
      setDeleting(null)
    }
  }, [onStockDeleted])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercent = (profit: number, currentValue: number) => {
    const percentage = (profit / (currentValue - profit)) * 100
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Portfolio Manager</CardTitle>
      </CardHeader>
      <CardContent>
        {stocks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No stock positions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Purchase Price</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Current Value</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock) => (
                <TableRow key={stock.ticker}>
                  <TableCell className="font-medium">{stock.ticker}</TableCell>
                  <TableCell className="text-right">{stock.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(stock.purchase_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(stock.current_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(stock.current_value)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {stock.profit >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={stock.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(stock.profit)}
                      </span>
                      <Badge 
                        variant={stock.profit >= 0 ? 'default' : 'destructive'}
                        className="ml-1"
                      >
                        {formatPercent(stock.profit, stock.current_value)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(stock.ticker)}
                      disabled={deleting === stock.ticker}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}