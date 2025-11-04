'use client'

interface PricingSummaryProps {
  subtotalCents: number
  taxCents: number
  discountCents: number
  totalCents: number
  currency: string
}

export function PricingSummary({
  subtotalCents,
  taxCents,
  discountCents,
  totalCents,
  currency,
}: PricingSummaryProps) {
  const formatPrice = (cents: number) => (cents / 100).toFixed(2)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-lg mb-4">💰 Pricing Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-medium">${formatPrice(subtotalCents)}</span>
        </div>

        {discountCents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Discounts</span>
            <span className="font-medium text-success-600">-${formatPrice(discountCents)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tax</span>
          <span className="font-medium">${formatPrice(taxCents)}</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex justify-between">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-lg text-brand-600">
              ${formatPrice(totalCents)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">{currency}</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-sm mb-3">Quick Stats</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3">
            <div className="text-gray-600 dark:text-gray-400 text-xs">Subtotal</div>
            <div className="font-semibold mt-1">${formatPrice(subtotalCents)}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3">
            <div className="text-gray-600 dark:text-gray-400 text-xs">Tax</div>
            <div className="font-semibold mt-1">${formatPrice(taxCents)}</div>
          </div>
        </div>
      </div>

      {totalCents > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-sm text-blue-700 dark:text-blue-400">
          <p className="font-medium">💡 Pricing calculated automatically</p>
          <p className="text-xs mt-1">Updates in real-time as you modify items</p>
        </div>
      )}
    </div>
  )
}
