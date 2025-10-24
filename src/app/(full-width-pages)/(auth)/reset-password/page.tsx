import { ResetPasswordForm } from '@/components/domains/auth'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Reset Password | Thiam',
  description: 'Create a new password for your Thiam account',
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const token = params.token

  // Redirect to forgot password if no token provided
  if (!token) {
    redirect('/forgot-password')
  }

  return <ResetPasswordForm token={token} />
}
