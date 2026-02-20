'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditCard, DollarSign, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrency } from '@/hooks/use-currency'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  onConfirm: (method: 'cash' | 'card' | 'mobile') => void
}

/**
 * PaymentModal Component
 * Handles payment method selection
 * Supports cash, card, and mobile payments
 */
export function PaymentModal({ isOpen, onClose, amount, onConfirm }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { formatAmount } = useCurrency()

  const handlePayment = (method: 'cash' | 'card' | 'mobile') => {
    setIsProcessing(true)
    console.log('[PaymentModal] Processing payment:', { method, amount })

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onConfirm(method)
      toast.success(`Payment of ${formatAmount(amount)} processed via ${method}`)
      console.log('[PaymentModal] Payment successful:', method)
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
          <DialogDescription>
            Total Amount: <span className="font-bold text-lg text-gray-900">{formatAmount(amount)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {/* Cash */}
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center"
            onClick={() => handlePayment('cash')}
            disabled={isProcessing}
          >
            <DollarSign className="h-8 w-8 mb-2 text-green-600" />
            <span className="font-semibold">Cash</span>
          </Button>

          {/* Card */}
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center"
            onClick={() => handlePayment('card')}
            disabled={isProcessing}
          >
            <CreditCard className="h-8 w-8 mb-2 text-blue-600" />
            <span className="font-semibold">Card</span>
          </Button>

          {/* Mobile */}
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center"
            onClick={() => handlePayment('mobile')}
            disabled={isProcessing}
          >
            <Smartphone className="h-8 w-8 mb-2 text-purple-600" />
            <span className="font-semibold">Mobile Payment</span>
          </Button>
        </div>

        {isProcessing && (
          <p className="text-center text-sm text-gray-500">Processing payment...</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
