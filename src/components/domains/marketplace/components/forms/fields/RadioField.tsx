'use client'

import { RadioGroup, RadioGroupItem } from '@/components/shared/ui/radio-group'
import { Label } from '@/components/shared/ui/label'
import { FieldError } from './FieldError'
import { FieldHint } from './FieldHint'

export interface RadioFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
}

export function RadioField({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  hint,
  disabled = false,
}: RadioFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
            <Label htmlFor={`${id}-${option.value}`} className="cursor-pointer font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {hint && !error && <FieldHint id={`${id}-hint`} hint={hint} />}
      {error && <FieldError id={`${id}-error`} error={error} />}
    </div>
  )
}
