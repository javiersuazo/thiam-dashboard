'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createOfferService } from '@/components/domains/offers/offer-builder/adapters'
import type { Offer } from '@/components/domains/offers/offer-builder/types'
import Button from '@/components/shared/ui/button/Button'

export default function OfferPreviewPage() {
  const params = useParams()
  const offerId = params.id as string
  const [offer, setOffer] = useState<Offer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOffer()
  }, [offerId])

  const loadOffer = async () => {
    try {
      const offerService = createOfferService()
      const loadedOffer = await offerService.getOfferById(offerId)
      setOffer(loadedOffer)
    } catch (error) {
      console.error('Failed to load offer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupItemsByCategory = (items: any[]) => {
    return {
      food: items.filter(i => i.itemType === 'menu_item'),
      equipment: items.filter(i => i.itemType === 'equipment'),
      service: items.filter(i => i.itemType === 'service'),
      delivery: items.filter(i => i.itemType === 'delivery'),
    }
  }

  const calculateTotals = () => {
    if (!offer) return { subtotalCents: 0, taxCents: 0, discountCents: 0, totalCents: 0 }

    const subtotalCents = offer.blocks.reduce((sum, block) => {
      return sum + block.items.reduce((blockSum, item) => blockSum + item.lineItemTotal, 0)
    }, 0)

    const taxCents = offer.blocks.reduce((sum, block) => {
      return sum + block.items.reduce((blockSum, item) => {
        const taxRate = item.taxRateBps || 0
        return blockSum + Math.round(item.lineItemTotal * taxRate / 10000)
      }, 0)
    }, 0)

    const discountCents = offer.discountCents || 0
    const totalCents = subtotalCents + taxCents - discountCents

    return { subtotalCents, taxCents, discountCents, totalCents }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Not Found</h2>
          <p className="text-gray-600">The offer you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const totals = calculateTotals()

  return (
    <>
      {/* Print-optimized styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          button, nav, header, .print-hide {
            display: none !important;
          }

          .print-show {
            display: block !important;
          }

          .print-break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 print:bg-white">
        {/* Header - Hidden on print */}
        <div className="bg-white border-b border-gray-200 print-hide sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Catering Proposal</h1>
                <p className="text-sm text-gray-600 mt-0.5">Review your customized offer</p>
              </div>
              <Button
                variant="primary"
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 print:py-0">
          {/* Print Header - Only visible when printing */}
          <div className="hidden print-show mb-8">
            <div className="border-b-4 border-gray-900 pb-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Catering Proposal
                  </h1>
                  <p className="text-xl text-gray-600">{offer.title}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Proposal ID</div>
                  <div className="font-mono text-sm font-semibold text-gray-900">{offer.id}</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Generated: {new Date().toLocaleDateString()}
                  </div>
                  {offer.validUntil && (
                    <div className="text-sm text-gray-600">
                      Valid Until: {new Date(offer.validUntil).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Offer Title Card - Screen only */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 print-hide border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{offer.title}</h2>
                {offer.description && (
                  <p className="text-gray-600">{offer.description}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>ID: {offer.id}</span>
                  </div>
                  {offer.validUntil && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Valid Until: {new Date(offer.validUntil).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Total Investment</div>
                <div className="text-4xl font-bold text-gray-900">
                  ${(totals.totalCents / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Service Blocks */}
          <div className="space-y-8">
            {offer.blocks.map((block, index) => {
              const blockTotal = block.items.reduce((sum, item) => sum + item.lineItemTotal, 0)
              const groups = groupItemsByCategory(block.items)

              return (
                <div key={block.id} className="print-break-inside-avoid">
                  {/* Timeline connector - screen only */}
                  {index < offer.blocks.length - 1 && (
                    <div className="relative print-hide">
                      <div className="absolute left-8 top-full h-8 w-0.5 bg-gradient-to-b from-brand-300 to-transparent" />
                    </div>
                  )}

                  {/* Block Card */}
                  <div className="bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-gray-200 print:shadow-none print:rounded-lg print:mb-6">
                    {/* Block Header */}
                    <div className="bg-gradient-to-br from-brand-50 to-blue-50 border-b-2 border-gray-200 p-8 print:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center text-xl font-bold text-brand-600 shadow-md print:shadow-none">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">
                                {block.name}
                              </h3>
                              {block.description && (
                                <p className="text-gray-600 mt-1">{block.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-3xl font-bold text-gray-900">
                            ${(blockTotal / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Block Subtotal</div>
                        </div>
                      </div>

                      {/* Event Details Grid */}
                      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white/80 rounded-xl px-4 py-3 border border-gray-200 backdrop-blur-sm">
                          <div className="text-xs text-gray-500 mb-1">Date</div>
                          <div className="font-semibold text-gray-900">{block.date}</div>
                        </div>
                        <div className="bg-white/80 rounded-xl px-4 py-3 border border-gray-200 backdrop-blur-sm">
                          <div className="text-xs text-gray-500 mb-1">Service Time</div>
                          <div className="font-semibold text-gray-900">{block.startTime} - {block.endTime}</div>
                        </div>
                        {block.headcount && (
                          <div className="bg-white/80 rounded-xl px-4 py-3 border border-gray-200 backdrop-blur-sm">
                            <div className="text-xs text-gray-500 mb-1">Guests</div>
                            <div className="font-semibold text-gray-900">{block.headcount}</div>
                          </div>
                        )}
                        {block.location && (
                          <div className="bg-white/80 rounded-xl px-4 py-3 border border-gray-200 backdrop-blur-sm">
                            <div className="text-xs text-gray-500 mb-1">Location</div>
                            <div className="font-semibold text-gray-900 truncate">{block.location}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Block Items */}
                    <div className="p-8 space-y-8">
                      {/* Menu Items */}
                      {groups.food.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
                            <span className="text-3xl">🍽️</span>
                            <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Menu Items</h4>
                          </div>
                          <div className="space-y-3">
                            {groups.food.map(item => (
                              <div key={item.id} className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 text-lg">{item.itemName}</div>
                                  {item.itemDescription && (
                                    <div className="text-sm text-gray-600 mt-1">{item.itemDescription}</div>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-sm text-gray-500">× {item.quantity}</div>
                                  <div className="font-bold text-gray-900 text-lg">
                                    ${(item.lineItemTotal / 100).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Equipment */}
                      {groups.equipment.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
                            <span className="text-3xl">🔧</span>
                            <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Equipment & Rentals</h4>
                          </div>
                          <div className="space-y-3">
                            {groups.equipment.map(item => (
                              <div key={item.id} className="flex items-start justify-between gap-4 py-2">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{item.itemName}</div>
                                  {item.itemDescription && (
                                    <div className="text-sm text-gray-600">{item.itemDescription}</div>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-sm text-gray-500">× {item.quantity}</div>
                                  <div className="font-semibold text-gray-900">
                                    ${(item.lineItemTotal / 100).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Service */}
                      {groups.service.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
                            <span className="text-3xl">👔</span>
                            <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Service & Staff</h4>
                          </div>
                          <div className="space-y-3">
                            {groups.service.map(item => (
                              <div key={item.id} className="flex items-start justify-between gap-4 py-2">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{item.itemName}</div>
                                  {item.itemDescription && (
                                    <div className="text-sm text-gray-600">{item.itemDescription}</div>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-sm text-gray-500">× {item.quantity}</div>
                                  <div className="font-semibold text-gray-900">
                                    ${(item.lineItemTotal / 100).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Delivery */}
                      {groups.delivery.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
                            <span className="text-3xl">🚚</span>
                            <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Delivery & Setup</h4>
                          </div>
                          <div className="space-y-3">
                            {groups.delivery.map(item => (
                              <div key={item.id} className="flex items-start justify-between gap-4 py-2">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{item.itemName}</div>
                                  {item.itemDescription && (
                                    <div className="text-sm text-gray-600">{item.itemDescription}</div>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="font-semibold text-gray-900">
                                    ${(item.lineItemTotal / 100).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total Summary */}
          <div className="mt-8 bg-white rounded-3xl shadow-xl border-4 border-gray-900 p-8 print:shadow-none print:mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Investment Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">${(totals.subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold text-gray-900">${(totals.taxCents / 100).toFixed(2)}</span>
              </div>
              {totals.discountCents > 0 && (
                <div className="flex items-center justify-between text-lg text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">-${(totals.discountCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 pt-4 mt-4 flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">Total</span>
                <span className="text-4xl font-bold text-gray-900">
                  ${(totals.totalCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500 print-hide">
            <p>Have questions? Contact us to discuss this proposal.</p>
          </div>
        </div>
      </div>
    </>
  )
}
