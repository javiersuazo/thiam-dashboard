'use client'

import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/shared/ui/label'
import { FieldError } from './FieldError'
import { FieldHint } from './FieldHint'

export interface DateTimeFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type: 'date' | 'time' | 'datetime-local'
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
  min?: string
  max?: string
}

export function DateTimeField({
  id,
  label,
  value,
  onChange,
  type,
  required = false,
  error,
  hint,
  disabled = false,
  min,
  max,
}: DateTimeFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={min}
        max={max}
        className={error ? 'border-red-500' : ''}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {hint && !error && <FieldHint id={`${id}-hint`} hint={hint} />}
      {error && <FieldError id={`${id}-error`} error={error} />}
    </div>
  )
}
