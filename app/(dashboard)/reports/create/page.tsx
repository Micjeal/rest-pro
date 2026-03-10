'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, ArrowLeft, Save, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useReports } from '@/hooks/use-reports'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useCurrentUser } from '@/hooks/use-current-user'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CreateReportPage() {
  const router = useRouter()
  const { user: currentUser } = useCurrentUser()
  const { restaurants } = useRestaurants()
  const { createReport } = useReports()
  
  const [isCreating, setIsCreating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'monthly' as 'monthly' | 'weekly' | 'daily' | 'custom',
    date: new Date(),
    restaurant_id: '',
    data: {} as any
  })

  const selectedRestaurant = restaurants?.[0]?.id || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Report title is required')
      return
    }

    setIsCreating(true)
    
    try {
      const reportData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        date: formData.date.toISOString().split('T')[0],
        restaurant_id: selectedRestaurant || undefined,
        data: formData.data
      }

      const newReport = await createReport(reportData)
      
      if (newReport) {
        toast.success('Report created successfully!')
        router.push('/reports')
      } else {
        toast.error('Failed to create report')
      }
    } catch (error) {
      toast.error('Failed to create report')
    } finally {
      setIsCreating(false)
    }
  }

  const handlePreview = () => {
    setIsPreviewing(true)
  }

  const generateSampleData = () => {
    const sampleData = {
      total_sales: Math.floor(Math.random() * 50000) + 10000,
      orders: Math.floor(Math.random() * 500) + 100,
      customers: Math.floor(Math.random() * 300) + 50,
      average_order_value: Math.floor(Math.random() * 100) + 20,
      top_selling_items: [
        { name: 'Burger', sales: 150 },
        { name: 'Pizza', sales: 120 },
        { name: 'Salad', sales: 80 }
      ],
      payment_methods: {
        cash: 45,
        card: 40,
        mobile: 15
      }
    }
    
    setFormData(prev => ({ ...prev, data: sampleData }))
    toast.success('Sample data generated for preview')
  }

  if (isPreviewing) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setIsPreviewing(false)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </Button>
          <h1 className="text-2xl font-bold">Report Preview</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{formData.title || 'Untitled Report'}</span>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={generateSampleData}>
                  Generate Sample Data
                </Button>
                <Button onClick={handleSubmit} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Report'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Report Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {formData.type}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {format(formData.date, 'PPP')}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> Draft
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {format(new Date(), 'PPP')}
                  </div>
                </div>
              </div>

              {formData.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{formData.description}</p>
                </div>
              )}

              {Object.keys(formData.data).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Report Data</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(formData.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {Object.keys(formData.data).length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No data available for preview</p>
                  <p className="text-sm text-gray-400 mt-1">Generate sample data to see how the report will look</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/reports">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create New Report</h1>
        <p className="text-gray-600">Generate a new report for your restaurant</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Report Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., July 2024 Sales Report"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description of the report content"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Report Type *</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Report Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Data (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={JSON.stringify(formData.data, null, 2)}
                  onChange={(e) => {
                    try {
                      const data = JSON.parse(e.target.value)
                      setFormData(prev => ({ ...prev, data }))
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  placeholder="Enter JSON data for the report (optional)"
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter valid JSON data. This will be stored with the report.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Report
                </Button>
                
                <Button
                  type="submit"
                  disabled={isCreating || !formData.title.trim()}
                  className="w-full"
                >
                  {isCreating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Use descriptive titles for easy identification</li>
                  <li>• Include relevant dates in the title</li>
                  <li>• Add descriptions to provide context</li>
                  <li>• Preview before creating to ensure accuracy</li>
                  <li>• JSON data is optional but useful for analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
