'use client'

import { Checkbox } from '@/components/shared/ui/checkbox'
import { Label } from '@/components/shared/ui/label'
import { FieldError } from './FieldError'
import { FieldHint } from './FieldHint'

export interface CheckboxFieldProps {
  id: string
  label: string
  value: boolean
  onChange: (value: boolean) => void
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
}

export function CheckboxField({
  id,
  label,
  value,
  onChange,
  required = false,
  error,
  hint,
  disabled = false,
}: CheckboxFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={value}
          onCheckedChange={onChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />
        <Label htmlFor={id} className="cursor-pointer">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {hint && !error && <FieldHint id={`${id}-hint`} hint={hint} />}
      {error && <FieldError id={`${id}-error`} error={error} />}
    </div>
  )
}
