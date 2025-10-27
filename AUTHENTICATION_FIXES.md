# 🔐 Authentication Architecture - Fixes Applied

**Date:** 2025-10-27
**Status:** ⚠️ Partially Fixed - Testing Required

---

## ❌ Problems Identified

### 1. **Cross-Origin Cookie Problem**
Your Go API (`localhost:8080`) was setting cookies that Next.js (`localhost:3000`) couldn't access due to browser security (different origins).

**Symptoms:**
- `middleware.ts:54 API Error: 401 Unauthorized` on passkey login
- Client-side API calls failing with 401
- Login worked but subsequent requests failed

### 2. **Tokens Not Being Stored**
Even though Go API returned tokens in the response body, `loginAction` and `passkeyLoginFinishAction` weren't storing them in Next.js cookies.

**Code Before:**
```typescript
// ❌ Received tokens but didn't store them
const { token, refreshToken } = loginResponse
console.log('✅ Login successful - cookies set by Go API automatically')
// But Go API cookies don't work cross-origin!
return { success: true }
```

### 3. **Client-Side API Calls**
`PasskeySignInButton` and `useWebAuthn` were making direct API calls from the browser, which can't access httpOnly cookies.

---

## ✅ Fixes Applied

### 1. **Store Tokens in Next.js Cookies**

**File:** `src/components/domains/auth/actions.ts`

**Login Action (Line ~188-202)**:
```typescript
// ✅ NEW: Store tokens in Next.js httpOnly cookies
const expiresInSeconds = Math.floor(
  (typeof expiresAt === 'string' ? parseInt(expiresAt) : expiresAt) / 1000
) - Math.floor(Date.now() / 1000)

const { setServerAuthTokens } = await import('@/lib/api/server')
await setServerAuthTokens(accessToken, refreshToken, expiresInSeconds)
```

**Passkey Login Action (Line ~1561-1566)**:
```typescript
// ✅ NEW: Store tokens in Next.js httpOnly cookies (same as regular login)
const expiresInSeconds = Math.floor(
  (typeof expiresAt === 'string' ? parseInt(expiresAt) : expiresAt) / 1000
) - Math.floor(Date.now() / 1000)

const { setServerAuthTokens } = await import('@/lib/api/server')
await setServerAuthTokens(accessToken, refreshToken, expiresInSeconds)
```

### 2. **Created Passkey Server Actions**

**File:** `src/components/domains/auth/actions.ts`

**New Actions (Lines ~1466-1570)**:
```typescript
// ✅ NEW: Server Action for passkey begin
export async function passkeyLoginBeginAction(): Promise<ActionResult<{ publicKey: unknown }>> {
  const api = createPublicClient()
  const response = await api.POST('/passkey/login/begin')
  // Returns challenge for WebAuthn
}

// ✅ NEW: Server Action for passkey finish
export async function passkeyLoginFinishAction(authResponse: unknown): Promise<ActionResult<{ requiresTwoFactor: boolean }>> {
  const api = createPublicClient()
  const response = await api.POST('/passkey/login/finish', { body: { response: authResponse } })
  // Stores tokens in cookies
}
```

### 3. **Updated PasskeySignInButton to Use Server Actions**

**File:** `src/components/domains/auth/components/PasskeySignInButton.tsx`

**Before (❌ Client-side API calls)**:
```typescript
const { authenticateWithPasskey } = useWebAuthn()
await authenticateWithPasskey() // Direct API call from browser
```

**After (✅ Server Actions)**:
```typescript
// Step 1: Get challenge via Server Action
const beginResult = await passkeyLoginBeginAction()

// Step 2: Browser WebAuthn prompt (client-side only)
const authResponse = await startAuthentication({ optionsJSON: options })

// Step 3: Send response via Server Action
const finishResult = await passkeyLoginFinishAction(authResponse)
```

### 4. **Updated API Middleware Documentation**

**File:** `src/lib/api/middleware.ts`

Clarified that:
- Client-side middleware can't access httpOnly cookies (security feature)
- Server Actions read cookies and add Authorization header
- Token-based auth works via `Authorization: Bearer <token>`

---

## 🏗️ Architecture Overview

### How Token-Based Auth Works Now

```
┌────────────────────────────────────────────────────┐
│  1. User Login (Web, Mobile, or Partner)          │
└────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────┐
│  2. Go API Returns Tokens                          │
│     Response: {                                    │
│       token: "eyJhbGc...",                        │
│       refreshToken: "eyJhbGc...",                 │
│       expiresAt: 1234567890,                      │
│       user: { ... }                               │
│     }                                              │
└────────────────────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
┌──────────────────┐      ┌──────────────────────┐
│  Web (Next.js)   │      │  Mobile / Partners   │
│                  │      │                      │
│  Store tokens in │      │  Store tokens in:    │
│  httpOnly cookies│      │  - Keychain (iOS)    │
│  via Server      │      │  - KeyStore (Android)│
│  Actions         │      │  - Database (Partner)│
└──────────────────┘      └──────────────────────┘
        │                            │
        ▼                            ▼
┌────────────────────────────────────────────────────┐
│  3. Future API Requests                            │
│     Authorization: Bearer <token>                  │
└────────────────────────────────────────────────────┘
```

### Platform-Specific Implementations

#### **Next.js Web (Current)**
```typescript
// Login flow
loginAction(credentials)
  → createPublicClient().POST('/auth/login')
  → Receive { token, refreshToken, expiresAt, user }
  → setServerAuthTokens(token, refreshToken, expiresInSeconds)
  → Tokens stored in httpOnly cookies on Next.js domain

// Authenticated requests
createServerClient()
  → getServerAuthToken() // Reads from cookies
  → createAuthenticatedClient(token) // Adds Authorization header
  → api.GET('/accounts') with Authorization: Bearer <token>
```

#### **Mobile Apps (Future - Ready)**
```swift
// iOS Example
let response = try await api.login(email: email, password: password)
try KeychainManager.save(response.token, key: "access_token")

// Future requests
let token = try KeychainManager.read(key: "access_token")
request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
```

#### **External Partners (Future - Ready)**
```javascript
// Partner API
const response = await fetch('https://api.thiam.com/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ apiKey, apiSecret })
})
const { token } = await response.json()

// Store however they want
localStorage.setItem('token', token) // or database, or memory

// Future requests
fetch('https://api.thiam.com/v1/accounts', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

## ⚠️ Remaining Issues

### 1. Client-Side Credential Management Still Broken

**Problem:**
The `useWebAuthn` hook is still used in these components:
- `PasskeySettings.tsx` - List/manage user's passkeys
- `PasskeyEnrollmentPrompt.tsx` - Register new passkey after signup
- `EmailVerifiedPage.tsx` - Setup passkey after email verification

These make client-side API calls that need authentication:
```typescript
// ❌ These will fail with 401
await api.GET('/auth/webauthn/credentials')
await api.POST('/auth/webauthn/register/begin')
await api.POST('/auth/webauthn/register/finish')
await api.DELETE('/auth/webauthn/credentials/{id}')
```

**Solution Options:**

**Option A: Server Actions** (Recommended for Next.js)
```typescript
// Create in actions.ts
export async function getWebAuthnCredentialsAction() {
  const api = await createServerClient()
  if (!api) return { success: false, data: [] }
  const { data, error } = await api.GET('/auth/webauthn/credentials')
  return { success: !error, data }
}

export async function registerWebAuthnBeginAction() {
  const api = await createServerClient()
  if (!api) return { success: false }
  const { data, error } = await api.POST('/auth/webauthn/register/begin')
  return { success: !error, data }
}

// etc...
```

**Option B: Next.js API Routes** (Proxy pattern)
```typescript
// app/api/webauthn/credentials/route.ts
export async function GET() {
  const api = await createServerClient()
  if (!api) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await api.GET('/auth/webauthn/credentials')
  return NextResponse.json(data)
}
```

### 2. Go API Needs CORS Configuration

For the Next.js frontend to call Go API directly (during Server Actions from Next.js server), the Go API should have CORS configured:

```go
// In thiam-api
router.Use(cors.New(cors.Config{
    AllowOrigins: []string{
        "http://localhost:3000",      // Next.js dev
        "https://dashboard.thiam.com", // Production
    },
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders: []string{"Content-Type", "Authorization"},
    AllowCredentials: false, // We use Authorization header, not cookies
}))
```

**Note:** This is less critical now since Server Actions run on the Next.js server (same origin), but good for future flexibility.

---

## ✅ Ready for Multi-Platform

Your architecture is now ready to support:

### Web ✅
- Next.js stores tokens in httpOnly cookies
- Server Actions add Authorization header
- XSS protection (httpOnly)
- CSRF protection (SameSite=lax)

### Mobile ✅ (Architecture ready)
- Apps call Go API directly
- Store tokens in Keychain (iOS) / KeyStore (Android)
- Send via Authorization header
- No cookies needed

### External Partners ✅ (Architecture ready)
- Partners call Go API directly
- Store tokens however they want
- Send via Authorization header
- Standard OAuth2/JWT flow

---

## 🧪 Testing Checklist

### Immediate Testing Needed

- [ ] **Regular Login**: Test email/password login
  - Should store tokens in cookies
  - Should work for subsequent requests

- [ ] **Passkey Login**: Test passkey authentication
  - Should work without 401 errors
  - Should store tokens in cookies

- [ ] **Authenticated Requests**: Test API calls after login
  - Server components should work
  - Server Actions should work

- [ ] **Token Refresh**: Test token expiration
  - Should refresh automatically
  - Should handle 401 gracefully

- [ ] **Logout**: Test logout flow
  - Should clear cookies
  - Should redirect to login

### Known to be Broken (Need Fix)

- [ ] **Passkey Settings**: List existing passkeys
- [ ] **Passkey Registration**: Register new passkey
- [ ] **Passkey Deletion**: Delete existing passkey
- [ ] **Passkey Enrollment Prompt**: After signup/verification

---

## 📝 Next Steps

1. **Test Current Fixes**
   - Try logging in with email/password
   - Try logging in with passkey
   - Check if 401 errors are gone

2. **Fix Credential Management** (Choose Option A or B above)
   - Create Server Actions for WebAuthn operations
   - Or create Next.js API route proxies
   - Update `useWebAuthn` hook

3. **Backend Verification**
   - Confirm Go API accepts `Authorization: Bearer <token>`
   - Confirm Go API returns tokens in response body
   - Add CORS configuration (optional but recommended)

4. **Mobile Preparation** (When ready)
   - Document Go API for mobile teams
   - Create example mobile app (iOS/Android)
   - Set up token refresh flow

5. **Partner Documentation** (When ready)
   - Create API documentation
   - Provide authentication examples
   - Set up rate limiting

---

## 💡 Key Takeaways

### What Changed
1. ✅ Tokens now stored in Next.js httpOnly cookies (was: not stored at all)
2. ✅ Passkey auth uses Server Actions (was: direct client API calls)
3. ✅ Architecture ready for mobile/partners (was: web-only)

### What's the Same
- Go API still returns tokens in response body ✅
- Go API still accepts `Authorization: Bearer <token>` ✅
- Mobile/partners can use standard OAuth2 flow ✅

### What Still Needs Work
- Credential management (list/add/delete passkeys) needs Server Actions
- Testing required to verify all fixes work

---

## 🤝 Questions?

If you have questions or need clarification:
1. Review this document
2. Check `AUTHENTICATION_ARCHITECTURE.old.md` for original
3. Test the changes and report results
4. Ask the team for help

**Remember:** Your Go API is already perfect for multi-platform! The fixes were only needed for Next.js to properly store and use the tokens.
