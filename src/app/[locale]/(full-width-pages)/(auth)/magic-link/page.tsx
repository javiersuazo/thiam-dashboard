import { MagicLinkPage } from '@/components/domains/auth'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Magic Link Verification | Thiam',
  description: 'Verify your magic link and sign in to your Thiam account',
}

export default function MagicLink() {
  return <MagicLinkPage />
}
