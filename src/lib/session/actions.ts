'use server'

/**
 * Session Actions - Server actions for session management
 */

import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { sessionOptions } from './config'
import { SessionData } from './types'
import { redirect } from 'next/navigation'

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function requireAuth() {
  const session = await getSession()

  if (!session.user) {
    redirect('/signin')
  }

  return session
}

export async function requireRole(roleNames: string[]) {
  const session = await requireAuth()

  const hasRole = session.roles.some((role) =>
    roleNames.includes(role.name)
  )

  if (!hasRole) {
    redirect('/unauthorized')
  }

  return session
}

export async function logout() {
  const session = await getSession()
  session.destroy()
  redirect('/signin')
}

export async function switchAccount(accountId: string) {
  const session = await requireAuth()

  const account = session.accounts.find((acc) => acc.id === accountId)

  if (!account) {
    throw new Error('Account not found')
  }

  session.activeAccountId = accountId
  await session.save()

  return { success: true }
}
