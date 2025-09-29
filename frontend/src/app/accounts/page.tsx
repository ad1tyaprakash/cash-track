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
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, CreditCard, Building, Wallet, TrendingUp, TrendingDown } from "lucide-react"

function AccountsContent({ overview }: { overview: DashboardOverview }) {
  const [accounts, setAccounts] = useState([
    { 
      id: 1, 
      name: 'Chase Checking', 
      type: 'checking', 
      balance: 5420.50, 
      bank: 'Chase Bank',
      status: 'active',
      lastUpdate: '2025-09-29'
    },
    { 
      id: 2, 
      name: 'Savings Account', 
      type: 'savings', 
      balance: 12800.75, 
      bank: 'Bank of America',
      status: 'active',
      lastUpdate: '2025-09-29'
    },
    { 
      id: 3, 
      name: 'Chase Freedom', 
      type: 'credit', 
      balance: -2340.25, 
      bank: 'Chase Bank',
      status: 'active',
      lastUpdate: '2025-09-28'
    },
    { 
      id: 4, 
      name: 'Investment Account', 
      type: 'investment', 
      balance: overview.stock_data.reduce((sum, stock) => sum + stock.current_value, 0), 
      bank: 'Fidelity',
      status: 'active',
      lastUpdate: '2025-09-29'
    },
  ])

  const [newAccount, setNewAccount] = useState({ 
    name: '', 
    type: 'checking', 
    balance: '', 
    bank: '' 
  })

  const totalAssets = accounts
    .filter(account => account.balance > 0)
    .reduce((sum, account) => sum + account.balance, 0)

  const totalLiabilities = Math.abs(accounts
    .filter(account => account.balance < 0)
    .reduce((sum, account) => sum + account.balance, 0))

  const netWorth = totalAssets - totalLiabilities

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
      case 'savings':
        return <Building className="h-4 w-4" />
      case 'credit':
        return <CreditCard className="h-4 w-4" />
      case 'investment':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'bg-blue-500'
      case 'savings':
        return 'bg-green-500'
      case 'credit':
        return 'bg-red-500'
      case 'investment':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const addAccount = () => {
    if (newAccount.name && newAccount.bank && newAccount.balance) {
      const account = {
        id: accounts.length + 1,
        name: newAccount.name,
        type: newAccount.type,
        balance: parseFloat(newAccount.balance),
        bank: newAccount.bank,
        status: 'active' as const,
        lastUpdate: new Date().toISOString().split('T')[0]
      }
      setAccounts([...accounts, account])
      setNewAccount({ name: '', type: 'checking', balance: '', bank: '' })
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage all your financial accounts in one place</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Account Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalAssets.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.filter(a => a.balance > 0).length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalLiabilities.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.filter(a => a.balance < 0).length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netWorth.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total of {accounts.length} accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>Overview of your financial accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getAccountTypeColor(account.type)}`}>
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <div className="font-medium">{account.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {account.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.bank}</TableCell>
                  <TableCell>
                    <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${Math.abs(account.balance).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={account.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{account.lastUpdate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add New Account */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Account</CardTitle>
            <CardDescription>Connect a new financial account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                placeholder="e.g., Main Checking"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-type">Account Type</Label>
              <select
                id="account-type"
                className="w-full p-2 border rounded-md"
                value={newAccount.type}
                onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank/Institution</Label>
              <Input
                id="bank-name"
                placeholder="e.g., Chase Bank"
                value={newAccount.bank}
                onChange={(e) => setNewAccount({ ...newAccount, bank: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
              />
            </div>
            <Button onClick={addAccount} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Types</CardTitle>
            <CardDescription>Understanding different account categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500">
                  <Building className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Checking Account</p>
                  <p className="text-sm text-muted-foreground">For daily transactions and expenses</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500">
                  <Building className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Savings Account</p>
                  <p className="text-sm text-muted-foreground">For emergency funds and short-term goals</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Credit Card</p>
                  <p className="text-sm text-muted-foreground">For purchases and building credit</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Investment Account</p>
                  <p className="text-sm text-muted-foreground">For stocks, bonds, and long-term growth</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AccountsPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getDashboardOverview()
        setOverview(data)
      } catch (error) {
        console.error("Failed to load accounts data", error)
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
                Loading accounts data...
              </div>
            </div>
          ) : overview ? (
            <AccountsContent overview={overview} />
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 pb-10">
              <div className="w-full max-w-md rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                We couldn&apos;t load your accounts data right now. Please try refreshing the page.
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}