import TwoFactorVerification from '@/components/domains/auth/components/TwoFactorVerification'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Two-Factor Verification | Thiam',
  description: 'Enter your two-factor authentication code',
}

export default function TwoStepVerification() {
  return <TwoFactorVerification />
}
