'use client'

/**
 * TwoFactorSetup Component
 *
 * Displays QR code and secret for setting up TOTP 2FA.
 * User scans QR code with authenticator app or enters secret manually.
 */

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { setup2FAAction } from '../actions'
import type { TwoFactorSetupResponse } from '../types/auth.types'

interface TwoFactorSetupProps {
  onSetupComplete: () => void
  onCancel?: () => void
}

export default function TwoFactorSetup({ onSetupComplete, onCancel }: TwoFactorSetupProps) {
  const t = useTranslations('auth.twoFactor.setup')
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchSetupData() {
      try {
        setLoading(true)
        setError(null)

        const result = await setup2FAAction()

        if (!result.success) {
          setError(result.error)
          return
        }

        setSetupData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to setup 2FA')
      } finally {
        setLoading(false)
      }
    }

    fetchSetupData()
  }, [])

  const handleContinue = () => {
    onSetupComplete()
  }

  const handleCopySecret = async () => {
    if (setupData?.secret) {
      await navigator.clipboard.writeText(setupData.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{t('step1')}</p>
      </div>
    )
  }

  if (error) {
    return (
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
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Setup Error</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
        {onCancel && (
          <div className="mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    )
  }

  if (!setupData) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <Image
            src={setupData.qrCode}
            alt="2FA QR Code"
            width={256}
            height={256}
            className="h-64 w-64"
            unoptimized // QR codes are base64 data URIs
          />
        </div>
      </div>

      {/* Instructions */}
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
              {t('step1')}
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>{t('step1Description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry */}
      <div>
        <button
          type="button"
          onClick={() => setShowSecret(!showSecret)}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          {showSecret ? t('hideSecret') : t('showSecret')}
        </button>

        {showSecret && (
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Secret Key
            </label>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-sm text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                {setupData.secret}
              </code>
              <button
                type="button"
                onClick={handleCopySecret}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {copied ? t('secretCopied') : t('copySecret')}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Account: {setupData.accountID}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Issuer: {setupData.issuer}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
          >
            {t('cancel')}
          </button>
        )}
        <button
          type="button"
          onClick={handleContinue}
          className="rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
        >
          {t('next')}
        </button>
      </div>
    </div>
  )
}
