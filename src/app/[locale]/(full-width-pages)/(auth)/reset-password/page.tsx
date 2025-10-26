import { ResetPasswordForm } from '@/components/domains/auth'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | Thiam',
  description: 'Create a new password for your Thiam account',
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const tokenFromUrl = params.token

  // Token can come from URL (email link) or be entered manually (SMS code)
  return <ResetPasswordForm initialToken={tokenFromUrl} />
}
