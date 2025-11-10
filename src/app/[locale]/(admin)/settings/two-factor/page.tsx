'use client'

import { useState, useEffect } from 'react'
import {
  setupMFAAction,
  verifyMFASetupAction,
  disableMFAAction,
  getMFAStatusAction,
} from '@/components/domains/auth/mfa-actions'

type Step = 'loading' | 'status' | 'setup' | 'verify' | 'disable'

export default function TwoFactorSettingsPage() {
  const [step, setStep] = useState<Step>('loading')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0)

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [disableCode, setDisableCode] = useState('')

  useEffect(() => {
    loadMFAStatus()
  }, [])

  const loadMFAStatus = async () => {
    const result = await getMFAStatusAction()

    if (result.success && result.data) {
      setMfaEnabled(result.data.mfa_enabled)
      setBackupCodesRemaining(result.data.backup_codes_remaining)
      setStep('status')
    } else {
      setError(result.error || 'Failed to load MFA status')
      setStep('status')
    }
  }

  const handleSetupMFA = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    const result = await setupMFAAction()
    setLoading(false)

    if (result.success && result.data) {
      setQrCodeUrl(result.data.qr_code_url)
      setSecret(result.data.secret)
      setBackupCodes(result.data.backup_codes)
      setStep('verify')
    } else {
      setError(result.error || 'Failed to setup MFA')
    }
  }

  const handleVerifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    const result = await verifyMFASetupAction(verificationCode)
    setLoading(false)

    if (result.success) {
      setSuccess('Two-factor authentication enabled successfully!')
      setMfaEnabled(true)
      setStep('status')
      setVerificationCode('')
      await loadMFAStatus()
    } else {
      setError(result.error || 'Invalid code. Please try again.')
    }
  }

  const handleDisableMFA = async () => {
    if (!password || !disableCode) {
      setError('Please enter your password and a verification code')
      return
    }

    setLoading(true)
    setError('')

    const result = await disableMFAAction(password, disableCode)
    setLoading(false)

    if (result.success) {
      setSuccess('Two-factor authentication disabled successfully')
      setMfaEnabled(false)
      setStep('status')
      setPassword('')
      setDisableCode('')
      await loadMFAStatus()
    } else {
      setError(result.error || 'Failed to disable MFA')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
    setTimeout(() => setSuccess(''), 2000)
  }

  if (step === 'loading') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Two-Factor Authentication
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your account security with two-factor authentication.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {step === 'status' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Status: {mfaEnabled ? 'Enabled' : 'Disabled'}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {mfaEnabled
                  ? `You have ${backupCodesRemaining} backup code${backupCodesRemaining !== 1 ? 's' : ''} remaining.`
                  : 'Protect your account with TOTP two-factor authentication.'}
              </p>
            </div>
            <div>
              {mfaEnabled ? (
                <button
                  onClick={() => setStep('disable')}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  disabled={loading}
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={handleSetupMFA}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Setting up...' : 'Enable 2FA'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Scan QR Code
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Or enter this code manually:
            </h4>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-gray-100 p-3 font-mono text-sm dark:bg-gray-900">
                {secret}
              </code>
              <button
                onClick={() => copyToClipboard(secret)}
                className="rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Backup Codes
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Save these backup codes. You can use them to access your account if you lose your device.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded bg-gray-100 p-4 dark:bg-gray-900">
              {backupCodes.map((code, i) => (
                <code key={i} className="text-sm font-mono">{code}</code>
              ))}
            </div>
            <button
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
              className="mt-3 w-full rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Copy All Codes
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Verify Setup
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the 6-digit code from your authenticator app:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-900"
                maxLength={6}
              />
              <button
                onClick={handleVerifySetup}
                disabled={loading || verificationCode.length !== 6}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
              <button
                onClick={() => {
                  setStep('status')
                  setQrCodeUrl('')
                  setSecret('')
                  setBackupCodes([])
                  setVerificationCode('')
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'disable' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Disable Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enter your password and a verification code from your authenticator app to disable 2FA.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="000000"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-900"
                maxLength={6}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleDisableMFA}
                disabled={loading || !password || disableCode.length !== 6}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
              <button
                onClick={() => {
                  setStep('status')
                  setPassword('')
                  setDisableCode('')
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
