'use client'

import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/shared/ui/label'
import { FieldError } from './FieldError'
import { FieldHint } from './FieldHint'

export interface NumberFieldProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
  min?: number
  max?: number
  step?: number
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  hint,
  disabled = false,
  min,
  max,
  step = 1,
}: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={error ? 'border-red-500' : ''}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {hint && !error && <FieldHint id={`${id}-hint`} hint={hint} />}
      {error && <FieldError id={`${id}-error`} error={error} />}
    </div>
  )
}
