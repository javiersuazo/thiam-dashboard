'use client'

import { CheckoutFormFieldConfig } from '../../types'
import {
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
  RadioField,
  NumberField,
  DateTimeField,
  AddressField,
  PhoneField,
  AddressValue,
} from './fields'

export interface DynamicFieldProps {
  config: CheckoutFormFieldConfig
  value: any
  onChange: (value: any) => void
  error?: string
}

export function DynamicField({ config, value, onChange, error }: DynamicFieldProps) {
  const baseProps = {
    id: config.id,
    label: config.label,
    value,
    onChange,
    required: config.required,
    error,
    hint: config.hint,
  }

  switch (config.type) {
    case 'text':
      return <TextField {...baseProps} placeholder={config.placeholder} />

    case 'email':
      return <TextField {...baseProps} type="email" placeholder={config.placeholder} />

    case 'phone':
      return <PhoneField {...baseProps} placeholder={config.placeholder} />

    case 'textarea':
      return <TextAreaField {...baseProps} placeholder={config.placeholder} />

    case 'number':
      return <NumberField {...baseProps} placeholder={config.placeholder} />

    case 'select':
      return (
        <SelectField
          {...baseProps}
          options={config.options || []}
          placeholder={config.placeholder}
        />
      )

    case 'radio':
      return <RadioField {...baseProps} options={config.options || []} />

    case 'checkbox':
      return <CheckboxField {...baseProps} />

    case 'date':
      return <DateTimeField {...baseProps} type="date" />

    case 'time':
      return <DateTimeField {...baseProps} type="time" />

    case 'address':
      return <AddressField {...baseProps} value={value as AddressValue} />

    default:
      console.warn(`Unknown field type: ${config.type}`)
      return null
  }
}
