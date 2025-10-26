import VerifyEmailPage from '@/components/domains/auth/components/VerifyEmailPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Your Email | Thiam',
  description: 'Verify your email address to complete registration',
}

export default function VerifyEmail() {
  return <VerifyEmailPage />
}
