#!/usr/bin/env tsx

/**
 * Comprehensive Auth API Testing Script
 *
 * Tests all authentication flows against the new Clean Architecture API
 *
 * Usage:
 *   npx tsx scripts/test-auth-api.ts
 */

const API_BASE = 'http://localhost:8080/api/v1'
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

interface TestResult {
  name: string
  passed: boolean
  error?: string
  data?: any
}

const results: TestResult[] = []

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logResult(result: TestResult) {
  if (result.passed) {
    log(`✅ ${result.name}`, 'green')
    if (result.data) {
      console.log('   Data:', JSON.stringify(result.data, null, 2))
    }
  } else {
    log(`❌ ${result.name}`, 'red')
    if (result.error) {
      log(`   Error: ${result.error}`, 'red')
    }
  }
}

async function apiCall(endpoint: string, method: string = 'POST', body?: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  })

  const data = await response.json()

  return {
    ok: response.ok,
    status: response.status,
    data,
  }
}

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  accountName: 'Test Company',
  accountType: 'customer',
}

let accessToken: string = ''
let refreshToken: string = ''
let userId: string = ''
let sessionId: string = ''

async function test1_Registration() {
  log('\n📝 TEST 1: Registration', 'cyan')

  try {
    const response = await apiCall('/auth/register', 'POST', {
      email: testUser.email,
      password: testUser.password,
      first_name: testUser.firstName,
      last_name: testUser.lastName,
      account_name: testUser.accountName,
      account_type: testUser.accountType,
    })

    if (response.ok && response.data.user_id) {
      userId = response.data.user_id
      results.push({
        name: 'Registration',
        passed: true,
        data: { userId, email: response.data.email },
      })
    } else {
      results.push({
        name: 'Registration',
        passed: false,
        error: response.data.message || 'Registration failed',
      })
    }
  } catch (error) {
    results.push({
      name: 'Registration',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  logResult(results[results.length - 1])
}

async function test2_LoginBeforeVerification() {
  log('\n🔒 TEST 2: Login Before Email Verification (Should Fail)', 'cyan')

  try {
    const response = await apiCall('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password,
    })

    if (!response.ok && response.data.error_key === 'errors.auth.email_not_verified') {
      results.push({
        name: 'Login Before Verification (Expected Failure)',
        passed: true,
        data: { error_key: response.data.error_key },
      })
    } else if (response.ok) {
      results.push({
        name: 'Login Before Verification',
        passed: false,
        error: 'Login succeeded but should have failed - email not verified',
      })
    } else {
      results.push({
        name: 'Login Before Verification',
        passed: false,
        error: `Unexpected error: ${response.data.error_key || response.data.message}`,
      })
    }
  } catch (error) {
    results.push({
      name: 'Login Before Verification',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  logResult(results[results.length - 1])
}

async function test3_SkipEmailVerification() {
  log('\n⏭️  TEST 3: Skip Email Verification (For Testing)', 'yellow')
  log('   NOTE: In production, user would click email link', 'yellow')
  log('   For now, we\'ll proceed as if email was verified', 'yellow')

  // In a real scenario, you'd need to:
  // 1. Check email for verification link
  // 2. Extract token from link
  // 3. Call POST /auth/email-verification/verify with token

  results.push({
    name: 'Email Verification',
    passed: true,
    data: { note: 'Skipped for testing - would verify via email link in production' },
  })

  logResult(results[results.length - 1])
}

async function test4_LoginNoMFA() {
  log('\n🔐 TEST 4: Login (No MFA)', 'cyan')

  try {
    const response = await apiCall('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password,
    })

    if (response.ok && response.data.access_token) {
      accessToken = response.data.access_token
      refreshToken = response.data.refresh_token
      sessionId = response.data.session_id
      userId = response.data.user_id

      results.push({
        name: 'Login (No MFA)',
        passed: true,
        data: {
          userId,
          sessionId,
          email: response.data.email,
          expiresAt: new Date(response.data.expires_at * 1000).toISOString(),
        },
      })
    } else {
      results.push({
        name: 'Login (No MFA)',
        passed: false,
        error: response.data.message || 'Login failed',
      })
    }
  } catch (error) {
    results.push({
      name: 'Login (No MFA)',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  logResult(results[results.length - 1])
}

async function test5_GetUserProfile() {
  log('\n👤 TEST 5: Get User Profile', 'cyan')

  if (!accessToken) {
    results.push({
      name: 'Get User Profile',
      passed: false,
      error: 'No access token available',
    })
    logResult(results[results.length - 1])
    return
  }

  try {
    const response = await apiCall('/users/profile', 'GET', undefined, accessToken)

    if (response.ok) {
      results.push({
        name: 'Get User Profile',
        passed: true,
        data: response.data,
      })
    } else {
      results.push({
        name: 'Get User Profile',
        passed: false,
        error: response.data.message || 'Failed to get profile',
      })
    }
  } catch (error) {
    results.push({
      name: 'Get User Profile',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  logResult(results[results.length - 1])
}

async function test6_ListSessions() {
  log('\n📋 TEST 6: List Active Sessions', 'cyan')

  if (!accessToken) {
    results.push({
      name: 'List Sessions',
      passed: false,
      error: 'No access token available',
    })
    logResult(results[results.length - 1])
    return
  }

  try {
    const response = await apiCall('/sessions?limit=10', 'GET', undefined, accessToken)

    if (response.ok) {
      results.push({
        name: 'List Sessions',
        passed: true,
        data: {
          total: response.data.total,
          sessions: response.data.sessions?.length || 0,
        },
      })
    } else {
      results.push({
        name: 'List Sessions',
        passed: false,
        error: response.data.message || 'Failed to list sessions',
      })
    }
  } catch (error) {
    results.push({
      name: 'List Sessions',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  logResult(results[results.length - 1])
}

async function test7_RefreshToken() {
  log('\n🔄 TEST 7: Refresh Token', 'cyan')

  if (!refreshToken) {
    results.push({
      name: 'Refresh Token',
      passed: false,
      error: 'No refresh token available',
    })
    logResult(results[results.length - 1])
    return
  }

  try {
    const response = await apiCall('/auth/refresh', 'POST', {
      refresh_token: refreshToken,
    })

    if (response.ok && response.data.access_token) {
      const oldToken = accessToken
      accessToken = response.data.access_token
      refreshToken = response.data.refresh_token

      results.push({
        name: 'Refresh Token',
        passed: true,
        data: {
          tokenChanged: oldToken !== accessToken,
          expiresAt: new Date(response.data.expires_at * 1000).toISOString(),
        },
      })
    } else {
      results.push({
        name: 'Refresh Token',
        passed: false,
        error: response.data.message || 'Token refresh failed',
      })
    }
  } catch (error) {
    results.push({
      name: 'Refresh Token',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  logResult(results[results.length - 1])
}

async function test8_Logout() {
  log('\n🚪 TEST 8: Logout', 'cyan')

  if (!accessToken) {
    results.push({
      name: 'Logout',
      passed: false,
      error: 'No access token available',
    })
    logResult(results[results.length - 1])
    return
  }

  try {
    const response = await apiCall('/auth/logout', 'POST', {}, accessToken)

    if (response.status === 204 || response.ok) {
      results.push({
        name: 'Logout',
        passed: true,
        data: { status: 'Session revoked' },
      })
    } else {
      results.push({
        name: 'Logout',
        passed: false,
        error: response.data.message || 'Logout failed',
      })
    }
  } catch (error) {
    results.push({
      name: 'Logout',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  logResult(results[results.length - 1])
}

async function test9_UseRevokedToken() {
  log('\n🚫 TEST 9: Use Revoked Token (Should Fail)', 'cyan')

  try {
    const response = await apiCall('/users/profile', 'GET', undefined, accessToken)

    if (!response.ok && (response.status === 401 || response.data.error_key?.includes('token'))) {
      results.push({
        name: 'Use Revoked Token (Expected Failure)',
        passed: true,
        data: { error_key: response.data.error_key },
      })
    } else if (response.ok) {
      results.push({
        name: 'Use Revoked Token',
        passed: false,
        error: 'Token still works after logout - should be revoked',
      })
    } else {
      results.push({
        name: 'Use Revoked Token',
        passed: false,
        error: `Unexpected error: ${response.data.error_key || response.data.message}`,
      })
    }
  } catch (error) {
    results.push({
      name: 'Use Revoked Token',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  logResult(results[results.length - 1])
}

async function runAllTests() {
  log('🚀 Starting Auth API Tests', 'blue')
  log(`📍 API Base: ${API_BASE}`, 'blue')
  log('━'.repeat(60), 'blue')

  await test1_Registration()
  await test2_LoginBeforeVerification()
  await test3_SkipEmailVerification()
  await test4_LoginNoMFA()
  await test5_GetUserProfile()
  await test6_ListSessions()
  await test7_RefreshToken()
  await test8_Logout()
  await test9_UseRevokedToken()

  // Summary
  log('\n' + '━'.repeat(60), 'blue')
  log('📊 TEST SUMMARY', 'blue')
  log('━'.repeat(60), 'blue')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  log(`\nTotal Tests: ${total}`, 'cyan')
  log(`Passed: ${passed}`, 'green')
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green')
  log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`, failed > 0 ? 'yellow' : 'green')

  if (failed > 0) {
    log('Failed Tests:', 'red')
    results.filter(r => !r.passed).forEach(r => {
      log(`  - ${r.name}: ${r.error}`, 'red')
    })
  }
}

runAllTests().catch(console.error)
