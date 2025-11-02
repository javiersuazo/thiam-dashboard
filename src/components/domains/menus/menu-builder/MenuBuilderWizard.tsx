'use client'

import { useState, useEffect } from 'react'
import { MenuItem, MenuBuilder, WizardStep, PricingStrategy } from './types'
import { WizardProgress } from './WizardProgress'
import { MenuSetupStepMinimal } from './MenuSetupStepMinimal'
import { MenuBuilderCanvas } from './MenuBuilderCanvas'

interface MenuBuilderWizardProps {
  accountId: string
  initialMenu?: MenuBuilder
  availableItems: MenuItem[]
  onSave?: (menu: MenuBuilder) => void | Promise<void>
}

interface WizardData {
  name: string
  description?: string
  imageUrl?: string
  tags?: string[]
  availableFrom?: string
  availableTo?: string
  pricingStrategy?: PricingStrategy
  fixedPriceCents?: number
}

export function MenuBuilderWizard({
  accountId,
  initialMenu,
  availableItems,
  onSave,
}: MenuBuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('setup')
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([])
  const [wizardData, setWizardData] = useState<WizardData>({
    name: initialMenu?.name || '',
    description: initialMenu?.description,
    imageUrl: initialMenu?.imageUrl,
    tags: initialMenu?.tags,
    availableFrom: initialMenu?.availableFrom,
    availableTo: initialMenu?.availableTo,
    pricingStrategy: initialMenu?.pricingStrategy,
    fixedPriceCents: initialMenu?.fixedPriceCents,
  })

  useEffect(() => {
    if (initialMenu) {
      setCurrentStep('build')
      setCompletedSteps(['setup'])
      setWizardData({
        name: initialMenu.name,
        description: initialMenu.description,
        imageUrl: initialMenu.imageUrl,
        tags: initialMenu.tags,
        availableFrom: initialMenu.availableFrom,
        availableTo: initialMenu.availableTo,
        pricingStrategy: initialMenu.pricingStrategy || 'sum-of-items',
        fixedPriceCents: initialMenu.fixedPriceCents,
      })
    }
  }, [initialMenu])

  const handleSetupComplete = (data: {
    name: string
    description?: string
    imageUrl?: string
    tags?: string[]
    availableFrom?: string
    availableTo?: string
    pricingStrategy: PricingStrategy
    fixedPriceCents?: number
  }) => {
    setWizardData(prev => ({ ...prev, ...data }))
    setCompletedSteps(prev => [...new Set([...prev, 'setup'])])
    setCurrentStep('build')
  }

  const handleStepClick = (step: WizardStep) => {
    const stepOrder: WizardStep[] = ['setup', 'build']
    const currentIndex = stepOrder.indexOf(currentStep)
    const targetIndex = stepOrder.indexOf(step)

    if (targetIndex < currentIndex || completedSteps.includes(step)) {
      setCurrentStep(step)
    }
  }

  const enhancedOnSave = async (menu: MenuBuilder) => {
    const menuWithAllData: MenuBuilder = {
      ...menu,
      name: wizardData.name,
      description: wizardData.description,
      imageUrl: wizardData.imageUrl,
      tags: wizardData.tags,
      availableFrom: wizardData.availableFrom,
      availableTo: wizardData.availableTo,
      pricingStrategy: wizardData.pricingStrategy,
      fixedPriceCents: wizardData.fixedPriceCents,
    }

    await onSave?.(menuWithAllData)
    setCompletedSteps(prev => [...new Set([...prev, 'build'])])
  }

  return (
    <div className="flex flex-col h-full">
      <WizardProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {currentStep === 'setup' && (
          <MenuSetupStepMinimal
            initialData={{
              name: wizardData.name,
              description: wizardData.description,
              imageUrl: wizardData.imageUrl,
              tags: wizardData.tags,
              availableFrom: wizardData.availableFrom,
              availableTo: wizardData.availableTo,
              pricingStrategy: wizardData.pricingStrategy,
              fixedPriceCents: wizardData.fixedPriceCents,
            }}
            onContinue={handleSetupComplete}
          />
        )}

        {currentStep === 'build' && (
          <MenuBuilderCanvas
            accountId={accountId}
            initialMenu={initialMenu}
            availableItems={availableItems}
            onSave={enhancedOnSave}
            wizardMode={{
              menuName: wizardData.name,
              pricingStrategy: wizardData.pricingStrategy || 'sum-of-items',
              fixedPriceCents: wizardData.fixedPriceCents,
            }}
          />
        )}
      </div>
    </div>
  )
}
