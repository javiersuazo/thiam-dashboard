'use client'

/**
 * PasskeySettings Component
 *
 * Manages passkey/WebAuthn settings for authenticated users:
 * - View registered passkeys
 * - Add new passkeys (biometrics, security keys)
 * - Delete existing passkeys
 * - Platform authenticator detection (Touch ID, Face ID, Windows Hello)
 */

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useWebAuthn, isPlatformAuthenticatorAvailable } from '@/hooks/useWebAuthn'
import { toast } from 'sonner'

export default function PasskeySettings() {
  const t = useTranslations('auth.passkey.settings')
  const {
    credentials,
    isLoadingCredentials,
    registerPasskey,
    isRegistering,
    deletePasskey,
    isDeletingPasskey,
    isSupported,
  } = useWebAuthn()

  const [showAddPasskey, setShowAddPasskey] = useState(false)
  const [passkeyName, setPasskeyName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [hasPlatformAuth, setHasPlatformAuth] = useState<boolean | null>(null)

  // Check for platform authenticator on mount
  React.useEffect(() => {
    if (isSupported) {
      isPlatformAuthenticatorAvailable()
        .then(setHasPlatformAuth)
        .catch(() => setHasPlatformAuth(false))
    }
  }, [isSupported])

  const handleAddPasskey = async () => {
    if (!passkeyName.trim()) {
      toast.error(t('errors.nameRequired'))
      return
    }

    try {
      await registerPasskey(passkeyName.trim())
      toast.success(t('success.added'))
      setPasskeyName('')
      setShowAddPasskey(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.addFailed'))
    }
  }

  const handleDeletePasskey = async (credentialId: string) => {
    try {
      await deletePasskey(credentialId)
      toast.success(t('success.deleted'))
      setDeleteConfirm(null)
    } catch {
      toast.error(t('errors.deleteFailed'))
    }
  }

  // Browser not supported
  if (!isSupported) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {t('notSupported.title')}
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              {t('notSupported.message')}
            </p>
          </div>
        </div>
      </div>
    )
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

      {/* Platform Authenticator Info */}
      {hasPlatformAuth && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('platformAuth.title')}
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {t('platformAuth.message')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Registered Passkeys */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('list.title')}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t('list.subtitle')}
              </p>
            </div>
            <button
              onClick={() => setShowAddPasskey(true)}
              disabled={isRegistering}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {t('list.addButton')}
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoadingCredentials ? (
            <div className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('list.loading')}
            </div>
          ) : credentials.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                {t('list.empty.title')}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('list.empty.message')}
              </p>
            </div>
          ) : (
            credentials.map((credential) => (
              <div key={credential.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {credential.name || t('list.unnamed')}
                    </h4>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('list.created')}: {new Date(credential.createdAt).toLocaleDateString()}
                      {credential.lastUsedAt && (
                        <>
                          {' • '}
                          {t('list.lastUsed')}: {new Date(credential.lastUsedAt).toLocaleDateString()}
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(credential.id)}
                    disabled={isDeletingPasskey}
                    className="ml-4 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {t('list.delete')}
                  </button>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === credential.id && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {t('delete.confirm')}
                    </p>
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => handleDeletePasskey(credential.id)}
                        disabled={isDeletingPasskey}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {t('delete.confirmButton')}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        {t('delete.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Passkey Modal */}
      {showAddPasskey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('add.title')}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('add.subtitle')}
            </p>

            <div className="mt-4">
              <label
                htmlFor="passkey-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('add.nameLabel')}
              </label>
              <input
                type="text"
                id="passkey-name"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder={t('add.namePlaceholder')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                disabled={isRegistering}
                maxLength={100}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddPasskey}
                disabled={isRegistering || !passkeyName.trim()}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                {isRegistering ? t('add.registering') : t('add.registerButton')}
              </button>
              <button
                onClick={() => {
                  setShowAddPasskey(false)
                  setPasskeyName('')
                }}
                disabled={isRegistering}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('add.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
