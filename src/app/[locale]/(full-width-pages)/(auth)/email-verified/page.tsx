import EmailVerifiedPage from '@/components/domains/auth/components/EmailVerifiedPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Verified | Thiam',
  description: 'Your email has been successfully verified',
}

export default function EmailVerified() {
  return <EmailVerifiedPage />
}
