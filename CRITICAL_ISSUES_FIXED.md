# Critical Issues - FIXED ✅

## Issue #1: Hardcoded Frontend URL ✅ FIXED

### Problem
Magic link URLs were hardcoded to `http://localhost:3000` which would break in production.

### Solution
Added `FRONTEND_URL` environment variable to make it configurable.

### Changes Made

**Backend:**
1. **config/config.go** - Added `FrontendURL` field to App config
   ```go
   App struct {
       Name        string `env:"APP_NAME,required"`
       Version     string `env:"APP_VERSION,required"`
       Environment string `env:"APP_ENVIRONMENT" envDefault:"production"`
       FrontendURL string `env:"FRONTEND_URL" envDefault:"http://localhost:3000"` // NEW
   }
   ```

2. **internal/controller/http/v1/controller.go** - Added frontendURL field to UsersV1 struct
   ```go
   type UsersV1 struct {
       // ... other fields
       frontendURL string // Frontend URL for generating magic links
   }
   ```

3. **internal/controller/http/v1/router.go** - Pass frontendURL to controller
   ```go
   func NewUserRoutes(
       // ... other params
       frontendURL string, // Frontend URL for generating magic links
       // ... other params
   )
   ```

4. **internal/controller/http/v1/users.go** - Use config instead of hardcoded URL
   ```go
   // BEFORE:
   magicLink := fmt.Sprintf("http://localhost:3000/auth/passwordless/verify?token=%s", ott.Token)

   // AFTER:
   magicLink := fmt.Sprintf("%s/passwordless/verify?token=%s", r.frontendURL, ott.Token)
   ```

5. **internal/controller/http/router.go** - Wire up the config
   ```go
   v1.NewUserRoutes(..., deps.Config.App.FrontendURL, ...)
   ```

**Environment Files:**
- **.env** - Added `FRONTEND_URL=http://localhost:3000`
- **.env.example** - Added `FRONTEND_URL=http://localhost:3000` with documentation

### Production Setup
Set the environment variable in production:
```bash
# Development
FRONTEND_URL=http://localhost:3000

# Staging
FRONTEND_URL=https://staging.thiam.com

# Production
FRONTEND_URL=https://app.thiam.com
```

---

## Issue #2: Token in URL Query Parameter ⚠️ DOCUMENTED

### Current Status
Token is passed as a URL query parameter: `/passwordless/verify?token=abc123`

### Security Implications

**Risks:**
- ✅ Browser history leakage (mitigated by short TTL + one-time use)
- ✅ Referrer header leakage (mitigated by HTTPS + same-origin)
- ✅ Server logs (mitigated by short TTL + one-time use)
- ✅ Analytics/monitoring tools (mitigated by short TTL + one-time use)

**Mitigations Already in Place:**
- ✅ **One-time use** - Token is consumed immediately after first use
- ✅ **Short TTL** - Token expires in 15 minutes (configurable via `AUTH_OTT_SHORT_TTL`)
- ✅ **HTTPS in production** - Prevents man-in-the-middle attacks
- ✅ **Account lockout** - Prevents brute force attacks
- ✅ **Rate limiting** - 5 attempts per 15 minutes
- ✅ **Email verification required** - Users must have verified email
- ✅ **Logging & audit trail** - All attempts are logged

### Industry Standard
This approach is used by:
- Slack (magic links)
- Notion (magic links)
- Medium (passwordless login)
- Auth0 (password reset)

### Alternative Approaches (Not Implemented)

**Option 1: URL Fragment** (Better security, worse UX)
```
/passwordless/verify#token=abc123
```
- ✅ Not sent in Referer header
- ✅ Not logged on servers
- ❌ Requires JavaScript to read fragment
- ❌ More complex implementation
- ❌ Doesn't work with email clients that strip fragments

**Option 2: POST-based verification** (Better security, worse UX)
- User clicks link → Goes to page → JavaScript sends POST with token
- ✅ Token not in URL
- ❌ Requires JavaScript
- ❌ Extra step for user
- ❌ More complex implementation

**Option 3: WebAuthn/Passkeys** (Best security, requires device support)
- See WebAuthn section below

### Recommendation
**Keep current implementation** because:
1. Industry standard approach
2. Strong mitigations already in place
3. Excellent UX (single click)
4. Works without JavaScript
5. Compatible with all email clients

### Best Practices for Users
Include in email template:
```
⚠️ Security Notice:
- This link can only be used once
- It expires in 15 minutes
- Don't share this link with anyone
- If you're on a shared computer, close your browser after signing in
```

---

## Build Status

✅ Backend compiles successfully
✅ All changes tested
✅ Environment variables documented
✅ Production-ready

---

## Next Steps

### High Priority
1. ✅ Fix hardcoded URL - DONE
2. ✅ Add resend functionality with cooldown - DONE (see RESEND_FEATURE.md)
3. Add token expiration time to email/SMS templates
4. Add rate limit error messages to frontend
5. Phone number formatter component

### Medium Priority
6. Extract email templates to separate files
7. Security notification emails
8. Better error codes
9. Loading states & validation feedback

### Future Enhancements
10. WebAuthn/Passkeys support
11. Remember device functionality
12. Multiple emails/phones per user
13. Customizable email templates

---

# WebAuthn / Passkeys Implementation Guide

## Overview
WebAuthn (Web Authentication API) is the modern standard for passwordless authentication using biometrics, security keys, or platform authenticators.

## Complexity Assessment: MEDIUM-HIGH ⭐⭐⭐⭐

### Time Estimate: 2-3 days for basic implementation

---

## Implementation Breakdown

### Backend (Go) - ~1.5 days

**Database Changes (2 hours):**
```sql
CREATE TABLE webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id BYTEA NOT NULL UNIQUE,
    public_key BYTEA NOT NULL,
    attestation_type TEXT,
    transport TEXT[], -- usb, nfc, ble, internal
    aaguid BYTEA,
    sign_count INTEGER DEFAULT 0,
    name TEXT, -- "Face ID on iPhone", "YubiKey 5"
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMP,
    UNIQUE(user_id, credential_id)
);

CREATE INDEX idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);
```

**Library Setup (1 hour):**
```go
// go.mod
require (
    github.com/go-webauthn/webauthn v0.10.0
)

// internal/usecase/user/webauthn.go
type WebAuthnUser struct {
    ID          []byte
    Name        string
    DisplayName string
    Credentials []webauthn.Credential
}

func (u *User) WebAuthnID() []byte
func (u *User) WebAuthnName() string
func (u *User) WebAuthnDisplayName() string
func (u *User) WebAuthnCredentials() []webauthn.Credential
func (u *User) WebAuthnIcon() string
```

**Registration Flow (4 hours):**
```go
// 1. Start registration - generate challenge
POST /api/v1/auth/webauthn/register/begin
→ Returns challenge + credential creation options

// 2. Complete registration - verify & store credential
POST /api/v1/auth/webauthn/register/finish
→ Stores public key credential
```

**Authentication Flow (4 hours):**
```go
// 1. Start authentication - generate challenge
POST /api/v1/auth/webauthn/login/begin
→ Returns challenge + allowCredentials

// 2. Complete authentication - verify signature
POST /api/v1/auth/webauthn/login/finish
→ Verifies signature, issues JWT
```

**Credential Management (2 hours):**
```go
GET    /api/v1/users/me/webauthn/credentials // List all credentials
DELETE /api/v1/users/me/webauthn/credentials/:id // Revoke credential
PATCH  /api/v1/users/me/webauthn/credentials/:id // Rename credential
```

---

### Frontend (React/TypeScript) - ~1 day

**Browser API Integration (3 hours):**
```typescript
// useWebAuthn.ts
async function registerCredential() {
  // 1. Get options from server
  const options = await api.POST('/auth/webauthn/register/begin')

  // 2. Create credential (triggers biometric prompt)
  const credential = await navigator.credentials.create({
    publicKey: options.publicKey
  })

  // 3. Send to server for verification
  await api.POST('/auth/webauthn/register/finish', {
    credential: encodeCredential(credential)
  })
}

async function authenticate() {
  const options = await api.POST('/auth/webauthn/login/begin')

  const assertion = await navigator.credentials.get({
    publicKey: options.publicKey
  })

  const result = await api.POST('/auth/webauthn/login/finish', {
    assertion: encodeAssertion(assertion)
  })

  // Create session
  await saveSession(result.session)
}
```

**UI Components (3 hours):**
```typescript
// WebAuthnSetup.tsx - Registration flow
// WebAuthnLogin.tsx - Login flow
// CredentialList.tsx - Manage credentials
// BiometricButton.tsx - Platform-specific icons
```

**Feature Detection (1 hour):**
```typescript
const isWebAuthnSupported =
  window?.PublicKeyCredential !== undefined &&
  typeof window.PublicKeyCredential === 'function'

const isConditionalUI =
  await PublicKeyCredential.isConditionalMediationAvailable?.()

const isUserVerifying =
  await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
```

**Error Handling (1 hour):**
```typescript
try {
  await authenticate()
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // User cancelled
  } else if (error.name === 'InvalidStateError') {
    // Credential already registered
  } else if (error.name === 'NotSupportedError') {
    // Browser doesn't support WebAuthn
  }
}
```

---

### Testing (4 hours)

**Development Challenges:**
- ✅ HTTPS required (use mkcert for local development)
- ✅ Different behavior across browsers
- ✅ Platform-specific features (Touch ID, Face ID, Windows Hello)
- ✅ Hardware security key testing (YubiKey, etc.)

**Test Matrix:**
```
Chrome/Edge:
✅ Platform authenticator (Touch ID/Face ID/Windows Hello)
✅ Security keys (FIDO2/U2F)
✅ Conditional UI (autofill)

Safari:
✅ Touch ID on Mac
✅ Face ID on iPhone
⚠️  Limited conditional UI support

Firefox:
✅ Platform authenticator
✅ Security keys
❌ No conditional UI
```

---

## Benefits

### Security
- ✅ **Phishing resistant** - Credential tied to domain
- ✅ **No shared secrets** - Private key never leaves device
- ✅ **Strong authentication** - Biometric + possession
- ✅ **No password database** - Nothing to steal

### User Experience
- ✅ **Fast** - Single touch/click
- ✅ **Convenient** - No passwords to remember
- ✅ **Cross-device** - Passkeys sync via iCloud/Google
- ✅ **Accessible** - Biometrics easier than typing

### Business
- ✅ **Reduced support costs** - No password resets
- ✅ **Higher conversion** - Easier sign up
- ✅ **Compliance** - Meets FIDO2 standards
- ✅ **Future-proof** - Industry direction

---

## Challenges

### Technical
- ⚠️ **HTTPS required** - Can't test on plain HTTP
- ⚠️ **Browser compatibility** - Need fallback for old browsers
- ⚠️ **Device dependency** - Users need compatible device
- ⚠️ **Backup credentials** - Need recovery flow

### UX
- ⚠️ **User education** - New paradigm for users
- ⚠️ **Device loss** - Need account recovery
- ⚠️ **Multiple devices** - Register each device
- ⚠️ **Shared devices** - Not suitable for kiosks

---

## Recommended Approach

### Phase 1: Basic Implementation (Week 1)
1. Add WebAuthn registration for existing users
2. Implement authentication flow
3. Basic credential management
4. Fallback to password/passwordless for unsupported browsers

### Phase 2: Enhanced UX (Week 2)
1. Conditional UI (autofill suggestions)
2. Platform-specific branding (Touch ID icon on Mac, etc.)
3. Credential renaming & management
4. Multi-credential support

### Phase 3: Advanced Features (Week 3)
1. Passkeys sync across devices
2. Account recovery flow
3. Risk-based authentication (step-up with WebAuthn)
4. Enterprise attestation

---

## Code Libraries

**Backend:**
```go
github.com/go-webauthn/webauthn v0.10.0 // Most popular, well-maintained
```

**Frontend:**
```typescript
@simplewebauthn/browser v9.0.0 // Simplifies WebAuthn API
@simplewebauthn/server v9.0.0  // Backend helper (Node.js)
```

---

## Resources

- [WebAuthn.io](https://webauthn.io/) - Live demo
- [WebAuthn Guide](https://webauthn.guide/) - Visual explainer
- [FIDO Alliance](https://fidoalliance.org/) - Standards body
- [Can I Use WebAuthn](https://caniuse.com/webauthn) - Browser support
- [Passkeys.dev](https://passkeys.dev/) - Developer resources

---

## Recommendation

**Priority: MEDIUM-HIGH**

WebAuthn is the future of authentication, but you have solid passwordless auth already. Recommended timeline:

1. **Now:** Fix critical issues (hardcoded URL) ✅ DONE
2. **This Sprint:** Add resend, token expiration, phone formatter
3. **Next Sprint:** Extract email templates, security notifications
4. **Month 2:** WebAuthn/Passkeys implementation
5. **Month 3:** Advanced WebAuthn features (conditional UI, passkeys)

**ROI:** High security benefit, moderate implementation effort, future-proof investment.
