import CheckEmailPage from '@/components/domains/auth/components/CheckEmailPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check Your Email | Thiam',
  description: 'Check your email to verify your account',
}

export default function CheckEmail() {
  return <CheckEmailPage />
}
