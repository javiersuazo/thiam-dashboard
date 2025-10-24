'use client'

/**
 * TwoFactorSetupFlow Component
 *
 * Orchestrates the complete 2FA setup process:
 * 1. Display QR code for scanning
 * 2. Verify TOTP code
 * 3. Display and save backup codes
 */

import { useState } from 'react'
import TwoFactorSetup from './TwoFactorSetup'
import TwoFactorEnable from './TwoFactorEnable'
import BackupCodes from './BackupCodes'

type SetupStep = 'scan' | 'verify' | 'backup'

interface TwoFactorSetupFlowProps {
  onComplete: () => void
  onCancel?: () => void
}

export default function TwoFactorSetupFlow({ onComplete, onCancel }: TwoFactorSetupFlowProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('scan')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const handleSetupComplete = () => {
    setCurrentStep('verify')
  }

  const handleEnableComplete = (codes: string[]) => {
    setBackupCodes(codes)
    setCurrentStep('backup')
  }

  const handleBackToSetup = () => {
    setCurrentStep('scan')
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Indicator */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {/* Step 1: Scan */}
            <li className="relative flex-1">
              <div
                className={`flex items-center ${
                  currentStep === 'scan'
                    ? 'text-brand-600 dark:text-brand-400'
                    : currentStep === 'verify' || currentStep === 'backup'
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep === 'verify' || currentStep === 'backup'
                      ? 'border-brand-600 bg-brand-600 dark:border-brand-400 dark:bg-brand-400'
                      : currentStep === 'scan'
                        ? 'border-brand-600 dark:border-brand-400'
                        : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  {currentStep === 'verify' || currentStep === 'backup' ? (
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
                <span className="ml-2 text-sm font-medium">Scan QR Code</span>
              </div>
              {/* Connector Line */}
              <div className="absolute left-0 top-4 -ml-px mt-0.5 h-full w-full">
                <div
                  className={`h-0.5 w-full ${
                    currentStep === 'verify' || currentStep === 'backup'
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
                    : currentStep === 'backup'
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep === 'backup'
                      ? 'border-brand-600 bg-brand-600 dark:border-brand-400 dark:bg-brand-400'
                      : currentStep === 'verify'
                        ? 'border-brand-600 dark:border-brand-400'
                        : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  {currentStep === 'backup' ? (
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
                    <span className="text-sm font-medium">2</span>
                  )}
                </span>
                <span className="ml-2 text-sm font-medium">Verify Code</span>
              </div>
              {/* Connector Line */}
              <div className="absolute left-0 top-4 -ml-px mt-0.5 h-full w-full">
                <div
                  className={`h-0.5 w-full ${
                    currentStep === 'backup'
                      ? 'bg-brand-600 dark:bg-brand-400'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              </div>
            </li>

            {/* Step 3: Backup */}
            <li className="relative flex-1">
              <div
                className={`flex items-center ${
                  currentStep === 'backup'
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep === 'backup'
                      ? 'border-brand-600 dark:border-brand-400'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <span className="text-sm font-medium">3</span>
                </span>
                <span className="ml-2 text-sm font-medium">Save Backup Codes</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        {currentStep === 'scan' && (
          <TwoFactorSetup onSetupComplete={handleSetupComplete} onCancel={onCancel} />
        )}

        {currentStep === 'verify' && (
          <TwoFactorEnable onEnableComplete={handleEnableComplete} onBack={handleBackToSetup} />
        )}

        {currentStep === 'backup' && (
          <BackupCodes codes={backupCodes} onComplete={onComplete} />
        )}
      </div>
    </div>
  )
}
