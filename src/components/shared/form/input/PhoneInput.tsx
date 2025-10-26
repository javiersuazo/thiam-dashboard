/**
 * PhoneInput Component
 *
 * A modular, reusable phone number input with:
 * - International phone number formatting
 * - Country selector with flags
 * - react-hook-form integration
 * - Dark mode support
 * - Accessible (ARIA labels)
 * - Type-safe
 */

import React, { forwardRef } from 'react'
import PhoneInputWithCountry from 'react-phone-number-input'
import type { Value } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import './PhoneInput.css'

export interface PhoneInputComponentProps {
  /**
   * Current value (E.164 format: +14155552671)
   */
  value?: Value
  /**
   * Callback when value changes
   */
  onChange?: (value: Value) => void
  /**
   * Placeholder text
   */
  placeholder?: string
  /**
   * Whether the input is disabled
   */
  disabled?: boolean
  /**
   * Whether the input has an error
   */
  hasError?: boolean
  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string
  /**
   * ARIA described by (for error messages)
   */
  'aria-describedby'?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * PhoneInput component with country selector
 *
 * @example
 * ```tsx
 * <PhoneInput
 *   value={phone}
 *   onChange={setPhone}
 *   placeholder="Enter phone number"
 * />
 * ```
 *
 * @example With react-hook-form
 * ```tsx
 * <Controller
 *   name="phone"
 *   control={control}
 *   render={({ field, fieldState }) => (
 *     <PhoneInput
 *       value={field.value}
 *       onChange={field.onChange}
 *       hasError={!!fieldState.error}
 *     />
 *   )}
 * />
 * ```
 */
const PhoneInput = forwardRef<HTMLInputElement, PhoneInputComponentProps>(
  (
    {
      value,
      onChange,
      placeholder = '+1 (555) 000-0000',
      disabled = false,
      hasError = false,
      className = '',
      'aria-label': ariaLabel = 'Phone number',
      'aria-describedby': ariaDescribedby,
    },
    ref
  ) => {
    return (
      <PhoneInputWithCountry
        international
        defaultCountry="US"
        value={value}
        onChange={onChange as (value?: Value) => void}
        placeholder={placeholder}
        disabled={disabled}
        className={`phone-input-wrapper ${className}`}
        numberInputProps={{
          ref,
          'aria-label': ariaLabel,
          'aria-describedby': ariaDescribedby,
          'aria-invalid': hasError,
          className: `phone-input ${
            hasError
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-brand-500 focus:ring-brand-500'
          } ${
            disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-white dark:bg-gray-900'
          } block w-full rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`,
        }}
        countrySelectProps={{
          className: 'phone-country-select',
          'aria-label': 'Country',
        }}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export default PhoneInput
