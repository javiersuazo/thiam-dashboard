'use client'

/**
 * SMSRecoveryFlow Component
 *
 * Orchestrates the SMS recovery process for users who lost access to their 2FA:
 * 1. Request recovery code via SMS
 * 2. Verify SMS code to disable 2FA
 */

import { useState } from 'react'
import SMSRecoveryRequest from './SMSRecoveryRequest'
import SMSRecoveryVerify from './SMSRecoveryVerify'

type RecoveryStep = 'request' | 'verify' | 'success'

interface SMSRecoveryFlowProps {
  onComplete: () => void
  onCancel?: () => void
}

export default function SMSRecoveryFlow({ onComplete, onCancel }: SMSRecoveryFlowProps) {
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('request')
  const [email, setEmail] = useState('')

  const handleCodeSent = (sentToEmail: string) => {
    setEmail(sentToEmail)
    setCurrentStep('verify')
  }

  const handleRecoveryComplete = () => {
    setCurrentStep('success')
  }

  const handleBackToRequest = () => {
    setCurrentStep('request')
  }

  const handleSuccessComplete = () => {
    onComplete()
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
                  <span className="ml-2 text-sm font-medium">Request Code</span>
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
                  <span className="ml-2 text-sm font-medium">Verify Code</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      )}

      {/* Step Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        {currentStep === 'request' && (
          <SMSRecoveryRequest onCodeSent={handleCodeSent} onCancel={onCancel} />
        )}

        {currentStep === 'verify' && (
          <SMSRecoveryVerify
            email={email}
            onRecoveryComplete={handleRecoveryComplete}
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
                2FA Successfully Disabled
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Two-factor authentication has been removed from your account. You can now sign in
                using just your password.
              </p>
            </div>

            {/* Security Recommendation */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Security Recommendation
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    We strongly recommend re-enabling two-factor authentication to keep your
                    account secure. You can do this from your security settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-center border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSuccessComplete}
                className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
