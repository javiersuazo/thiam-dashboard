'use client'

import { useState } from 'react'
import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/shared/ui/label'
import { Textarea } from '@/components/shared/ui/textarea'
import { FieldError } from './FieldError'
import { FieldHint } from './FieldHint'

export interface AddressValue {
  street: string
  city: string
  postalCode: string
  country: string
  additionalInfo?: string
}

export interface AddressFieldProps {
  id: string
  label: string
  value: AddressValue
  onChange: (value: AddressValue) => void
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
}

export function AddressField({
  id,
  label,
  value,
  onChange,
  required = false,
  error,
  hint,
  disabled = false,
}: AddressFieldProps) {
  const handleFieldChange = (field: keyof AddressValue, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    })
  }

  return (
    <div className="space-y-4">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="space-y-3">
        <div>
          <Input
            id={`${id}-street`}
            placeholder="Street address"
            value={value.street}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            disabled={disabled}
            aria-label="Street address"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id={`${id}-city`}
            placeholder="City"
            value={value.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            disabled={disabled}
            aria-label="City"
          />
          <Input
            id={`${id}-postal-code`}
            placeholder="Postal code"
            value={value.postalCode}
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
            disabled={disabled}
            aria-label="Postal code"
          />
        </div>

        <div>
          <Input
            id={`${id}-country`}
            placeholder="Country"
            value={value.country}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            disabled={disabled}
            aria-label="Country"
          />
        </div>

        <div>
          <Textarea
            id={`${id}-additional`}
            placeholder="Additional information (apartment, floor, etc.)"
            value={value.additionalInfo || ''}
            onChange={(e) => handleFieldChange('additionalInfo', e.target.value)}
            disabled={disabled}
            rows={2}
            aria-label="Additional address information"
          />
        </div>
      </div>

      {hint && !error && <FieldHint id={`${id}-hint`} hint={hint} />}
      {error && <FieldError id={`${id}-error`} error={error} />}
    </div>
  )
}
