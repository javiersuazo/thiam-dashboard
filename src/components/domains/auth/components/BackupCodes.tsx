'use client'

/**
 * BackupCodes Component
 *
 * Displays backup codes after 2FA setup or regeneration.
 * Allows users to download or copy codes for safekeeping.
 */

import { useState } from 'react'

interface BackupCodesProps {
  codes: string[]
  onComplete: () => void
  showRegenerateWarning?: boolean
}

export default function BackupCodes({
  codes,
  onComplete,
  showRegenerateWarning = false,
}: BackupCodesProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const codesText = codes.join('\n')
    await navigator.clipboard.writeText(codesText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const codesText = codes.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `thiam-2fa-backup-codes-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=400')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Thiam 2FA Backup Codes</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                padding: 40px;
                max-width: 600px;
                margin: 0 auto;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 8px;
              }
              p {
                color: #666;
                margin-bottom: 24px;
              }
              .codes {
                background: #f5f5f5;
                padding: 20px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 14px;
              }
              .code {
                margin: 8px 0;
                letter-spacing: 2px;
              }
              .footer {
                margin-top: 24px;
                font-size: 12px;
                color: #999;
              }
            </style>
          </head>
          <body>
            <h1>Thiam 2FA Backup Codes</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <div class="codes">
              ${codes.map((code) => `<div class="code">${code}</div>`).join('')}
            </div>
            <div class="footer">
              Keep these codes in a safe place. Each code can only be used once.
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {showRegenerateWarning ? 'New Backup Codes Generated' : 'Save Your Backup Codes'}
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {showRegenerateWarning
            ? 'Your old backup codes are no longer valid. Save these new codes in a safe place.'
            : 'Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.'}
        </p>
      </div>

      {/* Warning Alert */}
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
              Important: Save These Codes
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <ul className="list-inside list-disc space-y-1">
                <li>Each code can only be used once</li>
                <li>These codes will not be shown again</li>
                <li>Keep them in a secure location (password manager, safe, etc.)</li>
                {showRegenerateWarning && (
                  <li className="font-semibold">Your previous backup codes are no longer valid</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Codes */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Your Backup Codes
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-600"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-600"
            >
              Download
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-600"
            >
              Print
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {codes.map((code, index) => (
            <div
              key={code}
              className="rounded-lg bg-white px-4 py-3 font-mono text-sm text-gray-900 dark:bg-gray-900 dark:text-gray-100"
            >
              <span className="text-gray-400 dark:text-gray-600">{index + 1}.</span> {code}
            </div>
          ))}
        </div>
      </div>

      {/* Acknowledgment */}
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="acknowledged"
            name="acknowledged"
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <div className="ml-3">
          <label htmlFor="acknowledged" className="text-sm text-gray-700 dark:text-gray-300">
            I have saved these backup codes in a secure location
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={onComplete}
          disabled={!acknowledged}
          className="rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showRegenerateWarning ? 'Done' : 'Complete Setup'}
        </button>
      </div>
    </div>
  )
}
