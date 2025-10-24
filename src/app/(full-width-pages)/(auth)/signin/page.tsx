import { SignInForm } from '@/components/domains/auth'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Thiam',
  description: 'Sign in to your Thiam account',
}

export default function SignIn() {
  return <SignInForm />
}
