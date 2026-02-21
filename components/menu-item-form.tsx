'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface MenuItemFormProps {
  restaurantId: string
  menuId: string
}

export function MenuItemForm({ restaurantId, menuId }: MenuItemFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    availability: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? !prev[name as keyof typeof prev] : value,
    }))
  }

  const handleCheckboxChange = () => {
    setFormData((prev) => ({ ...prev, availability: !prev.availability }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.price) {
      toast.error('Price is required')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          menu_id: menuId,
          price: parseFloat(formData.price),
        }),
      })

      if (!response.ok) throw new Error('Failed to create item')

      toast.success('Menu item created successfully!')
      router.push(`/dashboard/${restaurantId}`)
    } catch (error) {
      toast.error('Failed to create menu item')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Add Menu Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="price">Price (UGX) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="availability"
              checked={formData.availability}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="availability" className="font-normal cursor-pointer">
              Available
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Add Item'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
