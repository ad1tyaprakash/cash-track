'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit, Plus, Building, TrendingUp, DollarSign, Calendar } from "lucide-react"
import { toast } from "sonner"
import { addInvestment, updateInvestment, deleteInvestment, type CreateInvestmentPayload } from "@/lib/api"

interface Investment {
  id: string
  type: 'property' | 'mutual_fund' | 'bond' | 'commodity' | 'crypto' | 'other'
  name: string
  description?: string
  purchase_value: number
  current_value: number
  purchase_date: string
  last_updated: string
  quantity?: number
  location?: string 
  custom_type?: string 
}

interface InvestmentManagerProps {
  investments: Investment[]
  onInvestmentAdded: () => void
  onInvestmentUpdated: () => void
  onInvestmentDeleted: () => void
}

const INVESTMENT_TYPES = [
  { value: 'property', label: 'Property/Real Estate', icon: Building },
  { value: 'mutual_fund', label: 'Mutual Fund', icon: TrendingUp },
  { value: 'bond', label: 'Bond', icon: DollarSign },
  { value: 'commodity', label: 'Commodity', icon: DollarSign },
  { value: 'crypto', label: 'Cryptocurrency', icon: TrendingUp },
  { value: 'other', label: 'Other', icon: Plus },
]

export function InvestmentManager({ investments, onInvestmentAdded, onInvestmentUpdated, onInvestmentDeleted }: InvestmentManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
    purchase_value: '',
    current_value: '',
    purchase_date: '',
    quantity: '',
    location: '',
    custom_type: ''
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const resetForm = () => {
    setFormData({
      type: '',
      name: '',
      description: '',
      purchase_value: '',
      current_value: '',
      purchase_date: '',
      quantity: '',
      location: '',
      custom_type: ''
    })
  }

  const handleSubmit = async (isEdit = false) => {
    try {
      // Improved validation that handles "0" values correctly
      if (!formData.type || !formData.name.trim() || 
          formData.purchase_value === '' || formData.current_value === '' || 
          !formData.purchase_date) {
        toast.error("Please fill in all required fields")
        return
      }

      // Validate custom type for "other" category
      if (formData.type === 'other' && (!formData.custom_type || !formData.custom_type.trim())) {
        toast.error("Please specify the custom investment type")
        return
      }

      // Additional validation for numeric fields
      const purchaseValue = parseFloat(formData.purchase_value)
      const currentValue = parseFloat(formData.current_value)
      
      if (isNaN(purchaseValue) || purchaseValue < 0) {
        toast.error("Please enter a valid purchase value")
        return
      }
      
      if (isNaN(currentValue) || currentValue < 0) {
        toast.error("Please enter a valid current value")
        return
      }

      // Validate quantity if provided
      if (formData.quantity && (isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) < 0)) {
        toast.error("Please enter a valid quantity")
        return
      }

      const investmentData: CreateInvestmentPayload = {
        type: formData.type,
        name: formData.name.trim(),
        description: formData.description.trim(),
        purchase_value: purchaseValue,
        current_value: currentValue,
        purchase_date: new Date(formData.purchase_date).toISOString(),
        ...(formData.quantity && formData.quantity.trim() !== '' && { quantity: parseFloat(formData.quantity) }),
        ...(formData.location && formData.location.trim() !== '' && { location: formData.location.trim() }),
        ...(formData.type === 'other' && formData.custom_type && formData.custom_type.trim() !== '' && { custom_type: formData.custom_type.trim() })
      }

      if (isEdit && editingInvestment) {
        await updateInvestment(editingInvestment.id, investmentData)
        toast.success("Investment updated successfully!")
        onInvestmentUpdated()
        setIsEditDialogOpen(false)
      } else {
        await addInvestment(investmentData)
        toast.success("Investment added successfully!")
        onInvestmentAdded()
        setIsAddDialogOpen(false)
      }

      resetForm()
      setEditingInvestment(null)
    } catch (error) {
      toast.error(isEdit ? "Failed to update investment" : "Failed to add investment")
      console.error('Investment operation failed:', error)
    }
  }

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment)
    setFormData({
      type: investment.type,
      name: investment.name,
      description: investment.description || '',
      purchase_value: investment.purchase_value.toString(),
      current_value: investment.current_value.toString(),
      purchase_date: investment.purchase_date.split('T')[0], // Format for date input
      quantity: investment.quantity?.toString() || '',
      location: investment.location || '',
      custom_type: investment.custom_type || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (investment: Investment) => {
    if (!confirm(`Are you sure you want to delete "${investment.name}"?`)) {
      return
    }

    try {
      await deleteInvestment(investment.id)
      toast.success("Investment deleted successfully!")
      onInvestmentDeleted()
    } catch (error) {
      toast.error("Failed to delete investment")
      console.error('Delete investment failed:', error)
    }
  }

  const InvestmentForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="type">Investment Type *</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select investment type" />
          </SelectTrigger>
          <SelectContent>
            {INVESTMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'other' && (
        <div>
          <Label htmlFor="custom_type">Custom Investment Type *</Label>
          <Input
            id="custom_type"
            value={formData.custom_type}
            onChange={(e) => setFormData({ ...formData, custom_type: e.target.value })}
            placeholder="e.g., Art, Collectibles, etc."
          />
        </div>
      )}

      <div>
        <Label htmlFor="name">Investment Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={formData.type === 'property' ? 'e.g., Downtown Apartment' : 'e.g., Vanguard S&P 500'}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional details about this investment"
          rows={2}
        />
      </div>

      {formData.type === 'property' && (
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., New York, NY"
          />
        </div>
      )}

      {formData.type !== 'property' && (
        <div>
          <Label htmlFor="quantity">Quantity/Units</Label>
          <Input
            id="quantity"
            type="number"
            step="any"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="Number of shares/units"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchase_value">Purchase Value *</Label>
          <Input
            id="purchase_value"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchase_value}
            onChange={(e) => setFormData({ ...formData, purchase_value: e.target.value })}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="current_value">Current Market Value *</Label>
          <Input
            id="current_value"
            type="number"
            step="0.01"
            min="0"
            value={formData.current_value}
            onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="purchase_date">Purchase Date *</Label>
        <Input
          id="purchase_date"
          type="date"
          value={formData.purchase_date}
          onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            resetForm()
            setEditingInvestment(null)
            if (isEdit) {
              setIsEditDialogOpen(false)
            } else {
              setIsAddDialogOpen(false)
            }
          }}
        >
          Cancel
        </Button>
        <Button onClick={() => handleSubmit(isEdit)}>
          {isEdit ? 'Update Investment' : 'Add Investment'}
        </Button>
      </div>
    </div>
  )

  const getInvestmentsByType = () => {
    const grouped = investments.reduce((acc, investment) => {
      const key = investment.type === 'other' ? investment.custom_type || 'Other' : 
                  INVESTMENT_TYPES.find(t => t.value === investment.type)?.label || investment.type
      if (!acc[key]) acc[key] = []
      acc[key].push(investment)
      return acc
    }, {} as Record<string, Investment[]>)
    return grouped
  }

  const calculateMetrics = (investments: Investment[]) => {
    const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0)
    const totalCost = investments.reduce((sum, inv) => sum + inv.purchase_value, 0)
    const gainLoss = totalValue - totalCost
    const returnPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0
    return { totalValue, totalCost, gainLoss, returnPercent }
  }

  const InvestmentCard = ({ investment }: { investment: Investment }) => {
    const gainLoss = investment.current_value - investment.purchase_value
    const returnPercent = investment.purchase_value > 0 ? (gainLoss / investment.purchase_value) * 100 : 0
    const typeLabel = investment.type === 'other' ? investment.custom_type : 
                     INVESTMENT_TYPES.find(t => t.value === investment.type)?.label

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{investment.name}</CardTitle>
              <CardDescription>
                {typeLabel}
                {investment.location && ` • ${investment.location}`}
                {investment.quantity && ` • ${investment.quantity} units`}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(investment)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(investment)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Purchase Value:</span>
              <span>{formatCurrency(investment.purchase_value)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Current Value:</span>
              <span>{formatCurrency(investment.current_value)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Gain/Loss:</span>
              <span className={gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(gainLoss)} ({returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%)
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Purchased:</span>
              <span>{formatDate(investment.purchase_date)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Last Updated:</span>
              <span>{formatDate(investment.last_updated)}</span>
            </div>
            {investment.description && (
              <p className="text-xs text-muted-foreground mt-2">{investment.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const groupedInvestments = getInvestmentsByType()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Portfolio</h2>
          <p className="text-muted-foreground">Manage your properties and other investments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setEditingInvestment(null)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Investment</DialogTitle>
              <DialogDescription>
                Add a new investment to track its performance over time.
              </DialogDescription>
            </DialogHeader>
            <InvestmentForm />
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedInvestments).length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No investments yet</p>
            <p className="text-sm">Start by adding your first property or investment to track its performance.</p>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue={Object.keys(groupedInvestments)[0]} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            {Object.keys(groupedInvestments).map((type) => (
              <TabsTrigger key={type} value={type} className="text-xs">
                {type} ({groupedInvestments[type].length})
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedInvestments).map(([type, typeInvestments]) => {
            const metrics = calculateMetrics(typeInvestments)
            return (
              <TabsContent key={type} value={type} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatCurrency(metrics.totalValue)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatCurrency(metrics.totalCost)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Gain/Loss</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-xl font-bold ${metrics.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(metrics.gainLoss)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Return %</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-xl font-bold ${metrics.returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.returnPercent >= 0 ? '+' : ''}{metrics.returnPercent.toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {typeInvestments.map((investment) => (
                    <InvestmentCard key={investment.id} investment={investment} />
                  ))}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Investment</DialogTitle>
            <DialogDescription>
              Update your investment details and current market value.
            </DialogDescription>
          </DialogHeader>
          <InvestmentForm isEdit={true} />
        </DialogContent>
      </Dialog>
    </div>
  )
}