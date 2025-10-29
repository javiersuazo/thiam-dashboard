import PasswordlessVerifyForm from '@/components/domains/auth/components/PasswordlessVerifyForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Sign In | Thiam',
  description: 'Verify your passwordless sign in',
}

export default function PasswordlessVerify() {
  return <PasswordlessVerifyForm />
}
