import { ForgotPasswordForm } from '@/components/domains/auth'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password | Thiam',
  description: 'Reset your Thiam account password',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
