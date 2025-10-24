import { SignUpForm } from '@/components/domains/auth'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Thiam',
  description: 'Create your Thiam account',
}

export default function SignUp() {
  return <SignUpForm />
}
