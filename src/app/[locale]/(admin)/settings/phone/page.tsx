'use client'

import { useRouter } from 'next/navigation'
import PhoneVerificationFlow from '@/components/domains/auth/components/PhoneVerificationFlow'

export default function PhoneVerificationPage() {
  const router = useRouter()

  const handleComplete = (phone: string) => {
    router.push('/settings/profile')
  }

  const handleCancel = () => {
    router.push('/settings/profile')
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Phone Verification</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Verify your phone number to enable SMS notifications and two-factor authentication.
        </p>
      </div>

      <PhoneVerificationFlow onComplete={handleComplete} onCancel={handleCancel} />
    </div>
  )
}
