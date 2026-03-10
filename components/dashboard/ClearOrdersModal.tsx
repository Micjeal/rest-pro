'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface ClearOrdersModalProps {
  isOpen: boolean
  onClose: () => void
  eligibleOrdersCount: number
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export function ClearOrdersModal({
  isOpen,
  onClose,
  eligibleOrdersCount,
  onConfirm,
  isLoading = false
}: ClearOrdersModalProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isConfirmationValid = confirmationText === 'DELETE'

  const handleConfirm = async () => {
    if (!isConfirmationValid) {
      setError('Please type "DELETE" to confirm')
      return
    }

    setError(null)
    try {
      await onConfirm()
      setConfirmationText('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear orders')
    }
  }

  const handleClose = () => {
    setConfirmationText('')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Clear Old Orders
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              This will permanently delete <strong>{eligibleOrdersCount}</strong> completed orders 
              that are older than 7 days.
            </p>
            <p className="text-red-600 font-medium">
              This action cannot be undone.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Only orders with "completed" status and created more than 7 days ago will be deleted.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label htmlFor="confirmation" className="text-sm font-medium">
              Type <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">DELETE</code> to confirm:
            </label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => {
                setConfirmationText(e.target.value)
                setError(null)
              }}
              placeholder="Type DELETE to confirm"
              className={error ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Clear {eligibleOrdersCount} Orders
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
