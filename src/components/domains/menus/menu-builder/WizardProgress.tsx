'use client'

import { WizardStep } from './types'

interface WizardProgressProps {
  currentStep: WizardStep
  completedSteps: WizardStep[]
  onStepClick?: (step: WizardStep) => void
}

const STEPS: { id: WizardStep; label: string; description: string }[] = [
  { id: 'setup', label: 'Menu Setup', description: 'Details & pricing' },
  { id: 'build', label: 'Build Menu', description: 'Add items to courses' },
]

export function WizardProgress({ currentStep, completedSteps, onStepClick }: WizardProgressProps) {
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)

  return (
    <div className="w-full py-6 px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = currentStep === step.id
            const isClickable = isCompleted || index < currentStepIndex
            const isPast = index < currentStepIndex

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={`flex flex-col items-center gap-2 transition-all ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  } group`}
                >
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                        isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-900 scale-110'
                          : isCompleted
                            ? 'bg-green-500 text-white group-hover:scale-105'
                            : isPast
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:scale-105'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {isCurrent && (
                      <div className="absolute -inset-1 rounded-full animate-pulse bg-brand-400 opacity-20 -z-10" />
                    )}
                  </div>

                  <div className="text-center">
                    <p
                      className={`text-sm font-semibold transition-colors ${
                        isCurrent
                          ? 'text-brand-600 dark:text-brand-400'
                          : isCompleted
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </button>

                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 mb-8 relative">
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800" />
                    <div
                      className={`absolute inset-0 transition-all duration-500 ${
                        index < currentStepIndex
                          ? 'bg-green-500 w-full'
                          : index === currentStepIndex
                            ? 'bg-brand-600 w-1/2'
                            : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {completedSteps.length} of {STEPS.length} completed
            </span>
          </div>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span className="text-gray-500 dark:text-gray-500">
            {Math.round((completedSteps.length / STEPS.length) * 100)}% complete
          </span>
        </div>
      </div>
    </div>
  )
}
