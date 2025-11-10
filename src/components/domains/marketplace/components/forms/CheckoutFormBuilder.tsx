'use client'

import { useState, useEffect } from 'react'
import { CheckoutFormConfig, CheckoutFormStepConfig } from '../../types'
import { DynamicField } from './DynamicField'
import { Button } from '@/components/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card'

export interface CheckoutFormBuilderProps {
  config: CheckoutFormConfig
  initialData?: Record<string, any>
  onStepChange?: (step: number, data: Record<string, any>) => void
  onComplete: (data: Record<string, any>) => void
  onCancel?: () => void
}

export function CheckoutFormBuilder({
  config,
  initialData = {},
  onStepChange,
  onComplete,
  onCancel,
}: CheckoutFormBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentStepConfig = config.steps[currentStep]
  const isLastStep = currentStep === config.steps.length - 1

  useEffect(() => {
    if (currentStepConfig?.fields) {
      const newData = { ...formData }
      currentStepConfig.fields.forEach((field) => {
        if (!(field.id in newData)) {
          newData[field.id] = field.defaultValue ?? getDefaultValue(field.type)
        }
      })
      setFormData(newData)
    }
  }, [currentStep])

  const getDefaultValue = (type: string) => {
    switch (type) {
      case 'checkbox':
        return false
      case 'number':
        return 0
      case 'address':
        return { street: '', city: '', postalCode: '', country: '', additionalInfo: '' }
      default:
        return ''
    }
  }

  const shouldShowField = (field: any) => {
    if (!field.condition) return true

    const { field: conditionField, operator, value } = field.condition
    const fieldValue = formData[conditionField]

    switch (operator) {
      case 'equals':
        return fieldValue === value
      case 'not-equals':
        return fieldValue !== value
      case 'contains':
        return String(fieldValue).includes(value)
      case 'greater-than':
        return Number(fieldValue) > Number(value)
      case 'less-than':
        return Number(fieldValue) < Number(value)
      default:
        return true
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    currentStepConfig.fields.forEach((field) => {
      if (!shouldShowField(field)) return

      const value = formData[field.id]

      if (field.required) {
        if (field.type === 'address') {
          const addr = value as any
          if (!addr?.street || !addr?.city || !addr?.postalCode || !addr?.country) {
            newErrors[field.id] = 'All address fields are required'
          }
        } else if (field.type === 'checkbox') {
          if (!value) {
            newErrors[field.id] = 'This field is required'
          }
        } else if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.id] = 'This field is required'
        }
      }

      if (field.validation && value) {
        try {
          field.validation.parse(value)
        } catch (err: any) {
          newErrors[field.id] = err.errors?.[0]?.message || 'Invalid value'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return

    if (isLastStep) {
      onComplete(formData)
    } else {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      onStepChange?.(nextStep, formData)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      onStepChange?.(prevStep, formData)
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const visibleFields = currentStepConfig.fields.filter(shouldShowField)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{currentStepConfig.title}</CardTitle>
        {currentStepConfig.description && (
          <CardDescription>{currentStepConfig.description}</CardDescription>
        )}
        {config.showProgressBar && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Step {currentStep + 1} of {config.steps.length}
              </span>
              <span>{Math.round(((currentStep + 1) / config.steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / config.steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${currentStepConfig.fields[0]?.grid?.cols || 1}, 1fr)`,
          }}
        >
          {visibleFields.map((field) => (
            <div
              key={field.id}
              style={{
                gridColumn: field.grid?.span ? `span ${field.grid.span}` : undefined,
              }}
            >
              <DynamicField
                config={field}
                value={formData[field.id]}
                onChange={(value) => handleFieldChange(field.id, value)}
                error={errors[field.id]}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {onCancel && currentStep === 0 && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          <Button type="button" onClick={handleNext}>
            {isLastStep ? 'Complete' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
