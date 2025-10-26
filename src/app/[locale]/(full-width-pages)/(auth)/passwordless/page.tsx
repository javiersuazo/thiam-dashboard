import PasswordlessLoginForm from '@/components/domains/auth/components/PasswordlessLoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Passwordless Sign In | Thiam',
  description: 'Sign in to your Thiam account without a password',
}

export default function PasswordlessLogin() {
  return <PasswordlessLoginForm />
}
