'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Save, RotateCcw, Database, Printer, Bell, Shield, RefreshCw, AlertTriangle } from 'lucide-react'
import { useRestaurants } from '@/hooks/use-restaurants'
import { getCurrenciesByRegion, Currency } from '@/lib/currencies'
import { useCurrencyContext } from '@/contexts/CurrencyContext'

/**
 * Settings Page
 * Route: /settings
 * System configuration and settings management
 * Admin only access for restaurant configuration
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState({
    restaurant: {
      name: 'My Restaurant',
      address: '123 Main St, City, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'contact@restaurant.com',
      taxRate: 8.5,
      currency: 'UGX', // Default to Ugandan Shilling
    },
    pos: {
      receiptHeader: 'Thank you for dining with us!',
      receiptFooter: 'Please come again!',
      autoPrintReceipts: false,
      showTaxBreakdown: true,
      allowDiscounts: true,
      maxDiscountPercent: 25,
    },
    system: {
      backupEnabled: true,
      backupFrequency: 'daily',
      notificationEmail: 'admin@restaurant.com',
      maintenanceMode: false,
      debugMode: false,
    },
    security: {
      sessionTimeout: 30,
      requirePasswordForRefunds: true,
      requirePasswordForDiscounts: true,
      allowStaffLogin: true,
    }
  })

  const [loading, setLoading] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [previousCurrency, setPreviousCurrency] = useState<string>('UGX')
  const [showCurrencyConversionDialog, setShowCurrencyConversionDialog] = useState(false)
  
  // Use real data from hooks
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants()
  const { refreshCurrency } = useCurrencyContext()
  
  // Set default restaurant when data loads
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id)
    }
  }, [restaurants, selectedRestaurant])

  useEffect(() => {
    console.log('[Settings] Page loaded')
    if (selectedRestaurant) {
      loadSettings()
    }
  }, [selectedRestaurant])

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/settings?restaurantId=${selectedRestaurant}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const settingsData = await response.json()
      
      // Ensure numeric values are properly converted to numbers
      const processedSettings = {
        ...settingsData,
        restaurant: {
          ...settingsData.restaurant,
          taxRate: settingsData.restaurant?.taxRate ? Number(settingsData.restaurant.taxRate) : 8.5,
        },
        pos: {
          ...settingsData.pos,
          maxDiscountPercent: settingsData.pos?.maxDiscountPercent ? Number(settingsData.pos.maxDiscountPercent) : 25,
        },
        security: {
          ...settingsData.security,
          sessionTimeout: settingsData.security?.sessionTimeout ? Number(settingsData.security.sessionTimeout) : 30,
        }
      }
      
      setSettings(processedSettings)
      
      // Set previous currency to current currency when settings are loaded
      if (settingsData.restaurant?.currency) {
        setPreviousCurrency(settingsData.restaurant.currency)
        console.log('[Settings] Previous currency set to:', settingsData.restaurant.currency)
      }
      
      console.log('[Settings] Settings loaded from API')
    } catch (error) {
      console.error('[Settings] Error loading settings:', error)
      toast.error('Failed to load settings')
    }
  }

  const saveSettings = async () => {
    if (!selectedRestaurant) {
      toast.error('Please select a restaurant')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant,
          ...settings
        })
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        console.error('[Settings] Save failed:', responseData)
        throw new Error(responseData.error || 'Failed to save settings')
      }

      toast.success('Settings saved successfully')
      console.log('[Settings] Settings saved to API')
    } catch (error) {
      console.error('[Settings] Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleCurrencyConversion = async (convertPrices: boolean = true) => {
    if (!selectedRestaurant) {
      toast.error('Please select a restaurant')
      return
    }

    try {
      setLoading(true)
      const newCurrency = settings.restaurant.currency
      
      const response = await fetch('/api/currency/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant,
          fromCurrency: previousCurrency,
          toCurrency: newCurrency,
          conversionType: convertPrices ? 'all' : 'settings-only'
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success(`Currency updated to ${newCurrency}. ${result.message}`)
        console.log('[Settings] Currency conversion result:', result)
        
        // Refresh settings to get updated currency
        await loadSettings()
        
        // Refresh currency data globally
        await refreshCurrency(selectedRestaurant)
        
        // Trigger currency change event for immediate UI updates
        window.dispatchEvent(new CustomEvent('currencyChanged', {
          detail: { 
            newCurrency,
            previousCurrency,
            restaurantId: selectedRestaurant,
            timestamp: Date.now(),
            conversionResult: result
          }
        }))
      } else {
        toast.error(`Currency conversion failed: ${result.error}`)
      }
    } catch (error) {
      console.error('[Settings] Currency conversion error:', error)
      toast.error('Currency conversion failed. Please try again.')
    } finally {
      setLoading(false)
      setShowCurrencyConversionDialog(false)
    }
  }

  const confirmCurrencyChange = async () => {
    if (!selectedRestaurant) {
      toast.error('No restaurant selected')
      return
    }
    
    // Update currency without converting prices
    await updateSetting('restaurant', 'currency', settings.restaurant.currency)
    setShowCurrencyConversionDialog(false)
    toast.success(`Currency updated to ${settings.restaurant.currency}`)
    
    // Refresh currency data globally
    await refreshCurrency(selectedRestaurant)
    
    // Trigger currency change event for immediate UI updates
    window.dispatchEvent(new CustomEvent('currencyChanged', {
      detail: { 
        newCurrency: settings.restaurant.currency,
        previousCurrency,
        restaurantId: selectedRestaurant,
        timestamp: Date.now()
      }
    }))
  }

  const resetSettings = () => {
    const defaultSettings = {
      restaurant: {
        name: 'My Restaurant',
        address: '123 Main St, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'contact@restaurant.com',
        taxRate: 8.5,
        currency: 'UGX', // Default to Ugandan Shilling
      },
      pos: {
        receiptHeader: 'Thank you for dining with us!',
        receiptFooter: 'Please come again!',
        autoPrintReceipts: false,
        showTaxBreakdown: true,
        allowDiscounts: true,
        maxDiscountPercent: 25,
      },
      system: {
        backupEnabled: true,
        backupFrequency: 'daily',
        notificationEmail: 'admin@restaurant.com',
        maintenanceMode: false,
        debugMode: false,
      },
      security: {
        sessionTimeout: 30,
        requirePasswordForRefunds: true,
        requirePasswordForDiscounts: true,
        allowStaffLogin: true,
      }
    }
    setSettings(defaultSettings)
    toast.success('Settings reset to defaults')
  }

  const updateSetting = (category: string, field: string, value: any) => {
    // Skip currency changes since it's fixed to UGX
    if (category === 'restaurant' && field === 'currency') {
      return
    }
    
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure your restaurant system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Restaurant Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRestaurant || ''} onValueChange={setSelectedRestaurant} disabled={restaurantsLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant: any) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="restaurant" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="pos">POS Settings</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Restaurant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    value={settings.restaurant.name}
                    onChange={(e) => updateSetting('restaurant', 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="restaurantPhone">Phone</Label>
                  <Input
                    id="restaurantPhone"
                    value={settings.restaurant.phone}
                    onChange={(e) => updateSetting('restaurant', 'phone', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="restaurantAddress">Address</Label>
                <Input
                  id="restaurantAddress"
                  value={settings.restaurant.address}
                  onChange={(e) => updateSetting('restaurant', 'address', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="restaurantEmail">Email</Label>
                <Input
                  id="restaurantEmail"
                  type="email"
                  value={settings.restaurant.email}
                  onChange={(e) => updateSetting('restaurant', 'email', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    value={settings.restaurant.taxRate ?? 0}
                    onChange={(e) => updateSetting('restaurant', 'taxRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value="UGX" disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UGX">
                        UGX (USh) - Ugandan Shilling
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Currency is fixed to Ugandan Shilling</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                POS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="receiptHeader">Receipt Header</Label>
                <Input
                  id="receiptHeader"
                  value={settings.pos.receiptHeader}
                  onChange={(e) => updateSetting('pos', 'receiptHeader', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="receiptFooter">Receipt Footer</Label>
                <Input
                  id="receiptFooter"
                  value={settings.pos.receiptFooter}
                  onChange={(e) => updateSetting('pos', 'receiptFooter', e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoPrint">Auto-print Receipts</Label>
                  <Switch
                    id="autoPrint"
                    checked={settings.pos.autoPrintReceipts}
                    onCheckedChange={(checked) => updateSetting('pos', 'autoPrintReceipts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showTax">Show Tax Breakdown</Label>
                  <Switch
                    id="showTax"
                    checked={settings.pos.showTaxBreakdown}
                    onCheckedChange={(checked) => updateSetting('pos', 'showTaxBreakdown', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowDiscounts">Allow Discounts</Label>
                  <Switch
                    id="allowDiscounts"
                    checked={settings.pos.allowDiscounts}
                    onCheckedChange={(checked) => updateSetting('pos', 'allowDiscounts', checked)}
                  />
                </div>
              </div>
              {settings.pos.allowDiscounts && (
                <div>
                  <Label htmlFor="maxDiscount">Max Discount (%)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={settings.pos.maxDiscountPercent ?? 0}
                    onChange={(e) => updateSetting('pos', 'maxDiscountPercent', parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={settings.system.notificationEmail}
                  onChange={(e) => updateSetting('system', 'notificationEmail', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select value={settings.system.backupFrequency} onValueChange={(value) => updateSetting('system', 'backupFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="backupEnabled">Enable Backups</Label>
                  <Switch
                    id="backupEnabled"
                    checked={settings.system.backupEnabled}
                    onCheckedChange={(checked) => updateSetting('system', 'backupEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.system.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting('system', 'maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="debugMode">Debug Mode</Label>
                  <Switch
                    id="debugMode"
                    checked={settings.system.debugMode}
                    onCheckedChange={(checked) => updateSetting('system', 'debugMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout ?? 30}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value) || 30)}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requirePasswordRefunds">Require Password for Refunds</Label>
                  <Switch
                    id="requirePasswordRefunds"
                    checked={settings.security.requirePasswordForRefunds}
                    onCheckedChange={(checked) => updateSetting('security', 'requirePasswordForRefunds', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requirePasswordDiscounts">Require Password for Discounts</Label>
                  <Switch
                    id="requirePasswordDiscounts"
                    checked={settings.security.requirePasswordForDiscounts}
                    onCheckedChange={(checked) => updateSetting('security', 'requirePasswordForDiscounts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowStaffLogin">Allow Staff Login</Label>
                  <Switch
                    id="allowStaffLogin"
                    checked={settings.security.allowStaffLogin}
                    onCheckedChange={(checked) => updateSetting('security', 'allowStaffLogin', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Currency Conversion Dialog */}
      {showCurrencyConversionDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Currency Change Detected
              </h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                You're changing from <span className="font-bold">{previousCurrency}</span> to{' '}
                <span className="font-bold">{settings.restaurant.currency}</span>. Would you like to convert all existing prices?
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => handleCurrencyConversion(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loading ? 'Converting...' : 'Convert All Prices'}
                </Button>
                
                <Button
                  onClick={confirmCurrencyChange}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Update Currency Only
                </Button>
                
                <Button
                  onClick={() => setShowCurrencyConversionDialog(false)}
                  variant="ghost"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
