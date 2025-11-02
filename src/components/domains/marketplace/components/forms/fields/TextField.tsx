'use client'

import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/shared/ui/label'
import { FieldError } from './FieldError'
import { FieldHint } from './FieldHint'

export interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  hint,
  disabled = false,
  type = 'text',
}: TextFieldProps) {
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
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {hint && !error && <FieldHint id={`${id}-hint`} hint={hint} />}
      {error && <FieldError id={`${id}-error`} error={error} />}
    </div>
  )
}
