'use client'

/**
 * PhoneVerificationFlow Component
 *
 * Orchestrates the complete phone verification process:
 * 1. Request verification code via SMS
 * 2. Verify the SMS code
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import PhoneVerificationRequest from './PhoneVerificationRequest'
import PhoneVerificationCode from './PhoneVerificationCode'

type VerificationStep = 'request' | 'verify' | 'success'

interface PhoneVerificationFlowProps {
  /** Initial phone number (optional) */
  initialPhone?: string
  /** Callback when verification is complete */
  onComplete: (phone: string) => void
  /** Optional cancel handler */
  onCancel?: () => void
}

export default function PhoneVerificationFlow({
  initialPhone,
  onComplete,
  onCancel,
}: PhoneVerificationFlowProps) {
  const t = useTranslations('auth.phoneVerification.flow')
  const [currentStep, setCurrentStep] = useState<VerificationStep>('request')
  const [verifiedPhone, setVerifiedPhone] = useState('')

  const handleCodeSent = (phone: string) => {
    setVerifiedPhone(phone)
    setCurrentStep('verify')
  }

  const handleVerifySuccess = () => {
    setCurrentStep('success')
    // Small delay then notify parent
    setTimeout(() => {
      onComplete(verifiedPhone)
    }, 1500)
  }

  const handleBackToRequest = () => {
    setCurrentStep('request')
  }

  const handleResendCode = async () => {
    // Re-send code to the same phone number
    // In a real implementation, this would call the API again
    return Promise.resolve()
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Indicator */}
      {currentStep !== 'success' && (
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {/* Step 1: Request */}
              <li className="relative flex-1">
                <div
                  className={`flex items-center ${
                    currentStep === 'request'
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-brand-600 dark:text-brand-400'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      currentStep === 'verify'
                        ? 'border-brand-600 bg-brand-600 dark:border-brand-400 dark:bg-brand-400'
                        : 'border-brand-600 dark:border-brand-400'
                    }`}
                  >
                    {currentStep === 'verify' ? (
                      <svg
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">1</span>
                    )}
                  </span>
                  <span className="ml-2 text-sm font-medium">{t('step1Label')}</span>
                </div>
                {/* Connector Line */}
                <div className="absolute left-0 top-4 -ml-px mt-0.5 h-full w-full">
                  <div
                    className={`h-0.5 w-full ${
                      currentStep === 'verify'
                        ? 'bg-brand-600 dark:bg-brand-400'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                </div>
              </li>

              {/* Step 2: Verify */}
              <li className="relative flex-1">
                <div
                  className={`flex items-center ${
                    currentStep === 'verify'
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      currentStep === 'verify'
                        ? 'border-brand-600 dark:border-brand-400'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <span className="text-sm font-medium">2</span>
                  </span>
                  <span className="ml-2 text-sm font-medium">{t('step2Label')}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      )}

      {/* Step Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        {currentStep === 'request' && (
          <PhoneVerificationRequest
            initialPhone={initialPhone}
            onCodeSent={handleCodeSent}
            onCancel={onCancel}
          />
        )}

        {currentStep === 'verify' && (
          <PhoneVerificationCode
            phone={verifiedPhone}
            onVerifySuccess={handleVerifySuccess}
            onResendCode={handleResendCode}
            onBack={handleBackToRequest}
          />
        )}

        {currentStep === 'success' && (
          <div className="space-y-6 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <svg
                  className="h-10 w-10 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('success.title')}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t('success.message')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
