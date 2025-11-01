'use client'

import { useState } from 'react'
import { PricingStrategy } from './types'
import Button from '@/components/shared/ui/button/Button'

interface PricingStrategyStepProps {
  selectedStrategy?: PricingStrategy
  fixedPriceCents?: number
  onContinue: (strategy: PricingStrategy, fixedPrice?: number) => void
  onBack: () => void
}

export function PricingStrategyStep({
  selectedStrategy,
  fixedPriceCents,
  onContinue,
  onBack,
}: PricingStrategyStepProps) {
  const [strategy, setStrategy] = useState<PricingStrategy>(selectedStrategy || 'sum-of-items')
  const [fixedPrice, setFixedPrice] = useState<string>(
    fixedPriceCents ? (fixedPriceCents / 100).toFixed(2) : ''
  )

  const handleContinue = () => {
    if (strategy === 'fixed') {
      const priceCents = Math.round(parseFloat(fixedPrice || '0') * 100)
      onContinue(strategy, priceCents)
    } else {
      onContinue(strategy)
    }
  }

  const canProceed = strategy === 'sum-of-items' || (strategy === 'fixed' && parseFloat(fixedPrice) > 0)

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Choose Your Pricing Strategy
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          How would you like to price this menu?
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        <button
          onClick={() => setStrategy('sum-of-items')}
          className={`relative p-6 rounded-xl border-2 transition-all text-left ${
            strategy === 'sum-of-items'
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-lg scale-[1.02]'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                strategy === 'sum-of-items'
                  ? 'border-brand-500 bg-brand-500'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              {strategy === 'sum-of-items' && (
                <div className="w-3 h-3 rounded-full bg-white" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Sum of Items
                </h3>
                <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                The menu price is automatically calculated by adding up the prices of all selected items.
              </p>
              <div className="flex items-start gap-2 text-sm">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <p>✓ Prices update automatically when items change</p>
                  <p>✓ Transparent pricing for customers</p>
                  <p>✓ Easy to manage and maintain</p>
                </div>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStrategy('fixed')}
          className={`relative p-6 rounded-xl border-2 transition-all text-left ${
            strategy === 'fixed'
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-lg scale-[1.02]'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                strategy === 'fixed'
                  ? 'border-brand-500 bg-brand-500'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              {strategy === 'fixed' && (
                <div className="w-3 h-3 rounded-full bg-white" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Fixed Price
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Set a single fixed price for the entire menu, regardless of individual item prices.
              </p>

              {strategy === 'fixed' && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label htmlFor="fixedPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Menu Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">
                      $
                    </span>
                    <input
                      id="fixedPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={fixedPrice}
                      onChange={(e) => setFixedPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 text-sm mt-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <p>• Great for bundled deals or special offers</p>
                  <p>• Simple pricing for customers</p>
                  <p>• You control the profit margin</p>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!canProceed}
        >
          Continue to Build Menu
        </Button>
      </div>
    </div>
  )
}
