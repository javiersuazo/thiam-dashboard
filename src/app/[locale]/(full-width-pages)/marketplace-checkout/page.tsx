'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMarketplaceStore } from '@/components/domains/marketplace'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Textarea } from '@/components/shared/ui/textarea'
import { Label } from '@/components/shared/ui/label'
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'

export default function MarketplaceCheckoutPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart } = useMarketplaceStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'Germany',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryPostalCode: '',
    deliveryCountry: 'Germany',
    deliveryDate: '',
    deliveryTime: '',
    specialInstructions: '',
    sameAsBilling: true,
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log('Order submitted:', {
      formData,
      cart,
    })

    alert(
      `Order placed successfully!\n\nTotal: ${cart.items[0]?.product.currency || 'EUR'} ${cart.total.toFixed(2)}\nItems: ${cart.items.length}\n\nYou will receive a confirmation email at ${formData.email}`
    )

    setIsSubmitting(false)
    router.push('/en/marketplace-enhanced')
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <Button onClick={() => router.push('/en/marketplace-enhanced')}>
            Browse Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Marketplace</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">Checkout</h1>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="company">Company (Optional)</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </section>

                {/* Billing Address */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="billingAddress">Street Address *</Label>
                      <Input
                        id="billingAddress"
                        value={formData.billingAddress}
                        onChange={(e) => handleChange('billingAddress', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="billingCity">City *</Label>
                        <Input
                          id="billingCity"
                          value={formData.billingCity}
                          onChange={(e) => handleChange('billingCity', e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingPostalCode">Postal Code *</Label>
                        <Input
                          id="billingPostalCode"
                          value={formData.billingPostalCode}
                          onChange={(e) => handleChange('billingPostalCode', e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingCountry">Country *</Label>
                        <Input
                          id="billingCountry"
                          value={formData.billingCountry}
                          onChange={(e) => handleChange('billingCountry', e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Delivery Address */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={formData.sameAsBilling}
                        onChange={(e) => handleChange('sameAsBilling', e.target.checked)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      Same as billing
                    </label>
                  </div>

                  {!formData.sameAsBilling && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="deliveryAddress">Street Address *</Label>
                        <Input
                          id="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                          required={!formData.sameAsBilling}
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="deliveryCity">City *</Label>
                          <Input
                            id="deliveryCity"
                            value={formData.deliveryCity}
                            onChange={(e) => handleChange('deliveryCity', e.target.value)}
                            required={!formData.sameAsBilling}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deliveryPostalCode">Postal Code *</Label>
                          <Input
                            id="deliveryPostalCode"
                            value={formData.deliveryPostalCode}
                            onChange={(e) => handleChange('deliveryPostalCode', e.target.value)}
                            required={!formData.sameAsBilling}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deliveryCountry">Country *</Label>
                          <Input
                            id="deliveryCountry"
                            value={formData.deliveryCountry}
                            onChange={(e) => handleChange('deliveryCountry', e.target.value)}
                            required={!formData.sameAsBilling}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Delivery Details */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deliveryDate">Preferred Delivery Date *</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => handleChange('deliveryDate', e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryTime">Preferred Delivery Time *</Label>
                      <Input
                        id="deliveryTime"
                        type="time"
                        value={formData.deliveryTime}
                        onChange={(e) => handleChange('deliveryTime', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </section>

                {/* Special Instructions */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Special Instructions
                  </h2>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) => handleChange('specialInstructions', e.target.value)}
                    placeholder="Any dietary restrictions, setup instructions, or special requests..."
                    rows={4}
                    className="resize-none"
                  />
                </section>

                {/* Submit Button (Mobile) */}
                <div className="lg:hidden">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    {isSubmitting ? 'Processing...' : `Place Order • ${cart.items[0]?.product.currency || 'EUR'} ${cart.total.toFixed(2)}`}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 pb-4 border-b">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500">{item.product.catererName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                Math.max(item.product.minOrder || 1, item.quantity - 1)
                              )
                            }
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                            disabled={item.quantity <= (item.product.minOrder || 1)}
                          >
                            −
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {item.product.currency} {item.subtotal?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {cart.items[0]?.product.currency || 'EUR'} {cart.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (19%)</span>
                  <span className="font-medium">
                    {cart.items[0]?.product.currency || 'EUR'} {cart.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {cart.items[0]?.product.currency || 'EUR'} {cart.deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t text-base font-semibold">
                  <span>Total</span>
                  <span>
                    {cart.items[0]?.product.currency || 'EUR'} {cart.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button (Desktop) */}
              <div className="hidden lg:block">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isSubmitting ? 'Processing...' : `Place Order • ${cart.items[0]?.product.currency || 'EUR'} ${cart.total.toFixed(2)}`}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
