'use client'

/**
 * TwoFactorSettings Component
 *
 * Manages 2FA settings for authenticated users:
 * - View 2FA status
 * - Enable 2FA with setup flow
 * - Disable 2FA with confirmation
 * - Regenerate backup codes
 */

import { useState } from 'react'
import { disable2FAAction, regenerateBackupCodesAction } from '../actions'
import TwoFactorSetupFlow from './TwoFactorSetupFlow'
import BackupCodes from './BackupCodes'

interface TwoFactorSettingsProps {
  has2FAEnabled: boolean
  onStatusChange?: (enabled: boolean) => void
}

type ViewMode = 'status' | 'setup' | 'regenerate'

export default function TwoFactorSettings({
  has2FAEnabled: initialEnabled,
  onStatusChange,
}: TwoFactorSettingsProps) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(initialEnabled)
  const [viewMode, setViewMode] = useState<ViewMode>('status')
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [regeneratedCodes, setRegeneratedCodes] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnable2FA = () => {
    setViewMode('setup')
    setError(null)
  }

  const handleSetupComplete = () => {
    setIs2FAEnabled(true)
    setViewMode('status')
    onStatusChange?.(true)
  }

  const handleCancelSetup = () => {
    setViewMode('status')
  }

  const handleDisable2FA = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await disable2FAAction()

      if (!result.success) {
        setError(result.error)
        return
      }

      setIs2FAEnabled(false)
      setShowDisableConfirm(false)
      onStatusChange?.(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateCodes = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await regenerateBackupCodesAction()

      if (!result.success) {
        setError(result.error)
        return
      }

      setRegeneratedCodes(result.data.codes)
      setViewMode('regenerate')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate backup codes')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateComplete = () => {
    setRegeneratedCodes(null)
    setViewMode('status')
  }

  // Setup Flow View
  if (viewMode === 'setup') {
    return <TwoFactorSetupFlow onComplete={handleSetupComplete} onCancel={handleCancelSetup} />
  }

  // Regenerate Backup Codes View
  if (viewMode === 'regenerate' && regeneratedCodes) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <BackupCodes
            codes={regeneratedCodes}
            onComplete={handleRegenerateComplete}
            showRegenerateWarning={true}
          />
        </div>
      </div>
    )
  }

  // Status View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Two-Factor Authentication
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Add an extra layer of security to your account by requiring a verification code when
          signing in.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                is2FAEnabled
                  ? 'bg-green-100 dark:bg-green-900/20'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {is2FAEnabled ? (
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {is2FAEnabled ? '2FA Enabled' : '2FA Disabled'}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {is2FAEnabled
                  ? 'Your account is protected with two-factor authentication.'
                  : 'Enable 2FA to add an extra layer of security to your account.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {is2FAEnabled ? (
              <>
                <button
                  type="button"
                  onClick={handleRegenerateCodes}
                  disabled={loading}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Regenerate Backup Codes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisableConfirm(true)}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-300 hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:ring-red-800 dark:hover:bg-red-900/20"
                >
                  Disable 2FA
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEnable2FA}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Benefits */}
      {!is2FAEnabled && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                Why Enable 2FA?
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-inside list-disc space-y-1">
                  <li>Protects your account even if your password is compromised</li>
                  <li>Prevents unauthorized access to your data</li>
                  <li>Industry-standard security practice</li>
                  <li>Takes less than 2 minutes to set up</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable Confirmation Modal */}
      {showDisableConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Disable Two-Factor Authentication?
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  This will make your account less secure. You can always re-enable 2FA later.
                </p>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDisableConfirm(false)}
                    disabled={loading}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    disabled={loading}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Disabling...' : 'Yes, Disable 2FA'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
