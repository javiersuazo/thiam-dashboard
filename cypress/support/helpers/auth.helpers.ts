export function generateDeterministicEmailToken(email: string): string {
  const simplified = email.length > 20 ? email.substring(0, 20) : email
  return `DEV-EMAIL-${simplified}`
}

export function generateDeterministicResetToken(email: string): string {
  const simplified = email.length > 20 ? email.substring(0, 20) : email
  return `DEV-RESET-${simplified}`
}

export function generateDeterministicMagicToken(email: string): string {
  const simplified = email.length > 20 ? email.substring(0, 20) : email
  return `DEV-MAGIC-${simplified}`
}

export const DEV_SMS_CODE = '123456'

export function generateTestUser(suffix?: string) {
  const timestamp = Date.now()
  const uniqueSuffix = suffix || timestamp

  return {
    email: `test-${uniqueSuffix}@example.com`,
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    accountName: `Test Company ${uniqueSuffix}`,
    accountType: 'customer' as const,
    phone: `+1${String(timestamp).slice(-10)}`,
  }
}
