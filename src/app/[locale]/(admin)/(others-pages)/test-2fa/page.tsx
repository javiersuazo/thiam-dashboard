'use client'

import { useState } from 'react'
import { setup2FAAction, enable2FAAction } from '@/components/domains/auth/actions'
import Button from '@/components/shared/ui/button/Button'
import { toast } from 'sonner'
import Image from 'next/image'

export default function Test2FAPage() {
  const [setupData, setSetupData] = useState<{
    secret: string
    qrCode: string
    issuer: string
  } | null>(null)
  const [code, setCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSetup2FA = async () => {
    setIsLoading(true)
    try {
      const result = await setup2FAAction()

      if (!result.success || !result.data) {
        toast.error('error' in result ? result.error : 'Failed to setup 2FA')
        return
      }

      setSetupData(result.data)
      toast.success('2FA setup initiated! Scan the QR code with your authenticator app')
    } catch (err) {
      toast.error('Error setting up 2FA')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      const result = await enable2FAAction({ code })

      if (!result.success || !result.data) {
        toast.error('error' in result ? result.error : 'Invalid code or 2FA enable failed')
        return
      }

      setBackupCodes(result.data.backupCodes)
      toast.success('2FA enabled successfully! Save your backup codes.')
    } catch (err) {
      toast.error('Error enabling 2FA')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Test 2FA / TOTP Setup
      </h3>

      <div className="space-y-6">
        {/* Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
            Testing Instructions
          </h4>
          <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Sign in with <code className="rounded bg-blue-100 px-1 dark:bg-blue-800">admin@test.thiam.com</code></li>
            <li>Click &quot;Setup 2FA&quot; to generate a QR code</li>
            <li>Scan the QR code with Google Authenticator or Authy</li>
            <li>Enter the 6-digit code from your authenticator app</li>
            <li>Click &quot;Enable 2FA&quot; and save your backup codes</li>
          </ol>
        </div>

        {/* Setup Button */}
        {!setupData && (
          <div>
            <Button
              onClick={handleSetup2FA}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Setting up...' : 'Setup 2FA'}
            </Button>
          </div>
        )}

        {/* QR Code Display */}
        {setupData && !backupCodes.length && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-3 font-semibold text-gray-800 dark:text-white">
                Scan QR Code
              </h4>
              <div className="flex justify-center">
                <Image
                  src={setupData.qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                  className="rounded"
                />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">
                Or enter manually
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Secret Key:
              </p>
              <code className="mt-1 block break-all rounded bg-gray-100 p-2 text-sm dark:bg-gray-800">
                {setupData.secret}
              </code>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter 6-digit code
                </span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-lg tracking-widest dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  maxLength={6}
                />
              </label>

              <Button
                onClick={handleEnable2FA}
                disabled={isLoading || code.length !== 6}
                className="w-full"
              >
                {isLoading ? 'Enabling...' : 'Enable 2FA'}
              </Button>
            </div>
          </div>
        )}

        {/* Backup Codes */}
        {backupCodes.length > 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <h4 className="mb-3 font-semibold text-green-900 dark:text-green-100">
              ✅ 2FA Enabled Successfully!
            </h4>
            <p className="mb-3 text-sm text-green-800 dark:text-green-200">
              Save these backup codes in a safe place. Each code can only be used once.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((backupCode, index) => (
                <code
                  key={index}
                  className="rounded bg-green-100 px-3 py-2 text-center font-mono text-sm dark:bg-green-800"
                >
                  {backupCode}
                </code>
              ))}
            </div>
            <Button
              onClick={() => {
                const text = backupCodes.join('\n')
                navigator.clipboard.writeText(text)
                toast.success('Backup codes copied to clipboard!')
              }}
              variant="outline"
              className="mt-4 w-full"
            >
              Copy All Codes
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
