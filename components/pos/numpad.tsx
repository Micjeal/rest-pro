'use client'

import { Button } from '@/components/ui/button'

interface NumpadProps {
  onInput: (value: string) => void
  onClear: () => void
  onDone: () => void
}

/**
 * Numpad Component
 * Tablet-optimized numeric input for quantities
 * Large touch targets for easy operation
 */
export function Numpad({ onInput, onClear, onDone }: NumpadProps) {
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0', '.', '00'],
  ]

  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-white rounded-lg border">
      {/* Number buttons */}
      {numbers.map((row, i) => (
        <div key={i} className="contents">
          {row.map((num) => (
            <Button
              key={num}
              variant="outline"
              size="lg"
              className="text-lg font-semibold h-16"
              onClick={() => onInput(num)}
            >
              {num}
            </Button>
          ))}
        </div>
      ))}

      {/* Action buttons */}
      <Button
        variant="destructive"
        size="lg"
        className="col-span-2 h-16"
        onClick={onClear}
      >
        Clear
      </Button>
      <Button
        variant="default"
        size="lg"
        className="h-16 bg-blue-600 hover:bg-blue-700"
        onClick={onDone}
      >
        Done
      </Button>
    </div>
  )
}
