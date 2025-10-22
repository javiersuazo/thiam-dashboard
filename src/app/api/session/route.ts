/**
 * Session API Route - Provides session data to client
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session/actions'

export async function GET() {
  const session = await getSession()

  if (!session.user) {
    return NextResponse.json(null, { status: 401 })
  }

  return NextResponse.json({
    user: session.user,
    accounts: session.accounts,
    activeAccountId: session.activeAccountId,
    roles: session.roles,
    isImpersonating: session.isImpersonating,
    adminUserId: session.adminUserId,
  })
}
