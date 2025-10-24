# Authentication System - Implementation Plan

**World-Class Authentication with 2FA, SMS Recovery, and Top-Tier UX**

---

## 🎯 Goals

1. **Top-Notch UX** - Smooth, intuitive flows with the TailAdmin template design
2. **2FA Authentication** - TOTP (authenticator app) + SMS recovery
3. **Password Recovery** - Email OTT (One-Time Token) OR SMS code (user chooses)
4. **Security First** - httpOnly cookies, secure session management, OTT tokens
5. **Modern Architecture** - Server Actions, Server Components, React Query
6. **DDD Compliance** - Follow established domain patterns from requests domain

---

## 📊 Current State Analysis

### ✅ What We Have

**Template Components (in `_examples/auth/`):**
- `SignInForm.tsx` - Beautiful login UI with Google/X OAuth
- `SignUpForm.tsx` - Registration UI
- `OtpForm.tsx` - 6-digit code input with paste support
- `ResetPasswordForm.tsx` - Forgot password UI

**API Endpoints Available:**
```
Authentication:
- POST /auth/login                    # Email/password login
- POST /auth/logout                   # Logout
- POST /auth/google/login             # Google OAuth
- GET  /auth/google/callback          # OAuth callback

2FA Management:
- POST /auth/2fa/setup                # Generate TOTP secret + QR code
- POST /auth/2fa/enable               # Enable 2FA with verification
- POST /auth/2fa/disable              # Disable 2FA
- GET  /auth/2fa/backup-codes         # Generate backup codes
- POST /auth/2fa/recovery/sms         # Send SMS recovery code
- POST /auth/2fa/recovery/verify      # Verify SMS recovery code

Password Reset:
- POST /auth/password/forgot          # Request password reset (sends Email with OTT)
- POST /auth/password/reset           # Reset password with OTT token
- POST /auth/phone/send-code          # Alternative: Send SMS code
- POST /auth/phone/verify-code        # Alternative: Verify SMS code + reset

Phone Verification:
- POST /auth/phone/send-code          # Send SMS code
- POST /auth/phone/verify-code        # Verify SMS code

One-Time Tokens:
- POST /auth/ott                      # Generate one-time token
- POST /auth/ott/exchange             # Exchange token for session
```

**Infrastructure Already Built:**
- ✅ API client with middleware (`src/lib/api/`)
- ✅ Server-side utilities (`src/lib/api/server.ts`)
- ✅ React Query provider
- ✅ Cookie-based session management utilities

### ❌ What We Need to Build

1. **Authentication State Management**
2. **Server Actions** for all auth operations
3. **Multi-step Auth Flows** (2FA, password reset)
4. **Session Management** (login, logout, session refresh)
5. **Protected Routes** via middleware
6. **User Context** for client-side auth state
7. **Complete Auth Flow Components**

---

## 🏗️ Architecture Design

### 1. Folder Structure (Following DDD Conventions)

**Auth is both a DOMAIN and a FEATURE:**
- **Domain**: User authentication, session management, password reset (core business logic)
- **Feature**: Cross-cutting concern that affects all other domains (used everywhere)

Following the established pattern from `requests` domain:

```
src/
├── components/
│   ├── domains/
│   │   └── auth/                      # NEW - Auth Domain (following DDD)
│   │       ├── components/            # UI Components
│   │       │   ├── SignInForm.tsx
│   │       │   ├── SignUpForm.tsx
│   │       │   ├── TwoFactorSetup.tsx
│   │       │   ├── TwoFactorVerify.tsx
│   │       │   ├── ForgotPasswordForm.tsx
│   │       │   ├── ResetPasswordForm.tsx
│   │       │   ├── PasswordResetMethod.tsx  # NEW - Choose Email or SMS
│   │       │   ├── OtpInput.tsx
│   │       │   └── PasswordStrength.tsx
│   │       │
│   │       ├── hooks/                 # Auth-specific hooks
│   │       │   ├── useAuthForm.ts     # Form state management
│   │       │   ├── use2FASetup.ts     # 2FA setup flow
│   │       │   └── usePasswordReset.ts # Password reset flow
│   │       │
│   │       ├── types/                 # Domain types
│   │       │   └── auth.types.ts      # AuthUser, Session, etc.
│   │       │
│   │       ├── utils/                 # Domain utilities
│   │       │   ├── authHelpers.ts     # Format phone, validate email
│   │       │   ├── passwordStrength.ts # Password validation
│   │       │   └── sessionHelpers.ts  # Session utilities
│   │       │
│   │       ├── validation/            # Validation schemas
│   │       │   └── authSchemas.ts     # Zod schemas for auth forms
│   │       │
│   │       └── index.ts               # Public API (barrel export)
│   │
│   └── features/
│       └── session/                   # NEW - Session Feature (cross-domain)
│           ├── SessionProvider.tsx    # React Context Provider
│           ├── useSession.ts          # Client-side session hook
│           └── types.ts               # Session types
│
├── lib/
│   ├── auth/                          # Auth Business Logic Layer
│   │   ├── actions.ts                 # Server Actions
│   │   │   # - loginAction
│   │   │   # - logoutAction
│   │   │   # - signupAction
│   │   │   # - verify2FAAction
│   │   │   # - forgotPasswordEmailAction
│   │   │   # - forgotPasswordSMSAction
│   │   │   # - resetPasswordAction
│   │   │
│   │   ├── session.ts                 # Session management
│   │   │   # - createSession
│   │   │   # - getSession
│   │   │   # - deleteSession
│   │   │   # - validateSession
│   │   │
│   │   └── guards.ts                  # Auth guards
│   │       # - requireAuth (server component)
│   │       # - requireRole
│   │       # - requireAnonymous
│   │
│   └── api/                           # Existing - API client
│       └── ...
│
├── app/
│   ├── (auth)/                        # Auth Layout Group
│   │   ├── layout.tsx                 # Auth layout (full-width, no sidebar)
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── verify-2fa/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx               # Choose email or SMS
│   │   └── reset-password/
│   │       └── page.tsx               # Enter OTT/code + new password
│   │
│   └── (authenticated)/               # Protected routes (existing)
│       └── settings/
│           └── security/
│               └── page.tsx           # 2FA setup/disable
│
└── middleware.ts                      # Next.js middleware
```

**Key Changes:**
1. **Auth Domain** follows same structure as `requests` domain
2. **Session Feature** is separate (cross-cutting concern)
3. **lib/auth/** contains Server Actions and business logic
4. **Barrel exports** via index.ts for clean imports

### 2. Authentication Flows

#### **Flow 1: Sign In (No 2FA)**

```
┌─────────────┐
│  Sign In    │
│   Page      │
└──────┬──────┘
       │
       │ email + password
       ▼
┌─────────────────┐
│ Server Action:  │
│   loginAction() │
└──────┬──────────┘
       │
       │ POST /auth/login
       ▼
┌──────────────────┐
│  API Response:   │
│  { token, user } │
└──────┬───────────┘
       │
       │ Set httpOnly cookie
       ▼
┌───────────────────┐
│  Redirect to      │
│  /dashboard       │
└───────────────────┘
```

#### **Flow 2: Sign In (With 2FA Enabled)**

```
┌─────────────┐
│  Sign In    │
│   Page      │
└──────┬──────┘
       │
       │ email + password
       ▼
┌─────────────────────┐
│ Server Action:      │
│   loginAction()     │
└──────┬──────────────┘
       │
       │ POST /auth/login
       ▼
┌────────────────────────┐
│  API Response:         │
│  { requires2FA: true,  │
│    tempToken }         │
└──────┬─────────────────┘
       │
       │ Store tempToken
       ▼
┌───────────────────┐
│ Redirect to       │
│ /verify-2fa       │
└──────┬────────────┘
       │
       │ Enter 6-digit code
       ▼
┌─────────────────────┐
│ Server Action:      │
│   verify2FAAction() │
└──────┬──────────────┘
       │
       │ POST /auth/2fa/verify
       ▼
┌──────────────────┐
│  API Response:   │
│  { token, user } │
└──────┬───────────┘
       │
       │ Set httpOnly cookie
       ▼
┌───────────────────┐
│  Redirect to      │
│  /dashboard       │
└───────────────────┘
```

#### **Flow 3: 2FA Setup (First Time)**

```
┌─────────────────┐
│  Settings Page  │
│  "Enable 2FA"   │
└──────┬──────────┘
       │
       │ Click Enable 2FA
       ▼
┌──────────────────────┐
│ Server Action:       │
│   setup2FAAction()   │
└──────┬───────────────┘
       │
       │ POST /auth/2fa/setup
       ▼
┌───────────────────────────┐
│  API Response:            │
│  { secret, qrCode,        │
│    backupCodes }          │
└──────┬────────────────────┘
       │
       │ Display QR code
       ▼
┌────────────────────────────┐
│  /setup-2fa Page           │
│  - Show QR code            │
│  - Show backup codes       │
│  - Enter verification code │
└──────┬─────────────────────┘
       │
       │ Enter code from app
       ▼
┌─────────────────────────┐
│ Server Action:          │
│   enable2FAAction()     │
└──────┬──────────────────┘
       │
       │ POST /auth/2fa/enable
       ▼
┌──────────────────┐
│  2FA Enabled!    │
│  Show success    │
└──────────────────┘
```

#### **Flow 4: Forgot Password (Email OR SMS - User Chooses)**

```
┌─────────────────────┐
│  Sign In Page       │
│  "Forgot Password?" │
└──────┬──────────────┘
       │
       │ Click link
       ▼
┌──────────────────────────┐
│  /forgot-password Page   │
│  Choose Recovery Method: │
│  [ ] Email (default)     │
│  [ ] SMS                 │
└──────┬───────────────────┘
       │
       ├─── EMAIL PATH ────────────┐
       │                           │
       │ Enter email               │
       ▼                           │
┌────────────────────────┐         │
│ Server Action:         │         │
│   forgotPasswordEmail  │         │
│   Action()             │         │
└──────┬─────────────────┘         │
       │                           │
       │ POST /auth/password/forgot│
       ▼                           │
┌────────────────────────┐         │
│  Email Sent!           │         │
│  "Check your email for │         │
│   password reset link" │         │
└──────┬─────────────────┘         │
       │                           │
       │ Click link in email       │
       │ (includes OTT token)      │
       ▼                           │
┌────────────────────────┐         │
│ /reset-password?token= │         │
│  Show: New password    │         │
│        Confirm pass    │         │
└──────┬─────────────────┘         │
       │                           │
       │                           │
       └─────────┬─────────────────┘
                 │
       ┌─── SMS PATH ─────────────┐
       │                          │
       │ Enter phone number       │
       ▼                          │
┌────────────────────────┐        │
│ Server Action:         │        │
│   forgotPasswordSMS    │        │
│   Action()             │        │
└──────┬─────────────────┘        │
       │                          │
       │ POST /auth/phone/send-code
       ▼                          │
┌────────────────────────┐        │
│  SMS Sent!             │        │
│  Enter 6-digit code    │        │
└──────┬─────────────────┘        │
       │                          │
       │ Enter code + new password│
       ▼                          │
┌────────────────────────┐        │
│ Server Action:         │        │
│   resetPasswordSMS     │        │
│   Action()             │        │
└──────┬─────────────────┘        │
       │                          │
       │ POST /auth/phone/verify-code
       │ (includes password)      │
       ▼                          │
       └────────┬─────────────────┘
                │
                ▼
       ┌──────────────────┐
       │  Password Reset! │
       │  Redirect to     │
       │  /signin         │
       └──────────────────┘
```

**UX Enhancements:**
- Email is default (most common, more secure)
- SMS as alternative for users without email access
- Clear indication of which method was used
- Link in email goes directly to reset form (with token pre-filled)
- SMS path shows code input inline

#### **Flow 5: 2FA Recovery (Lost Authenticator App)**

```
┌────────────────────┐
│  /verify-2fa Page  │
│  "Lost Access?"    │
└──────┬─────────────┘
       │
       │ Click "Use SMS Recovery"
       ▼
┌───────────────────────────┐
│ Server Action:            │
│   send2FARecoveryAction() │
└──────┬────────────────────┘
       │
       │ POST /auth/2fa/recovery/sms
       ▼
┌────────────────────┐
│  SMS Sent!         │
│  Enter code        │
└──────┬─────────────┘
       │
       │ Enter 6-digit code
       ▼
┌─────────────────────────────┐
│ Server Action:              │
│   verify2FARecoveryAction() │
└──────┬────────────────────────┘
       │
       │ POST /auth/2fa/recovery/verify
       ▼
┌──────────────────┐
│  Verified!       │
│  Redirect to     │
│  /dashboard      │
└──────────────────┘
```

### 3. Session Management Strategy

**Cookie-Based Sessions (Secure):**
```typescript
// Server-side only (httpOnly cookies)
const SESSION_COOKIE = 'thiam_session'

// Cookie options
{
  httpOnly: true,           // Cannot be accessed by JavaScript (XSS protection)
  secure: true,             // HTTPS only in production
  sameSite: 'lax',          // CSRF protection
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/'
}
```

**Session Data Structure:**
```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    phone?: string
    role: 'customer' | 'caterer' | 'admin' | 'ops' | 'finance' | 'sales'
    accountId: string
    has2FAEnabled: boolean
  }
  token: string
  expiresAt: number
}
```

**Client-Side Access (via Context):**
```typescript
const { user, isAuthenticated, isLoading } = useSession()
```

### 4. Security Measures

1. **httpOnly Cookies** - No client-side JavaScript access to tokens
2. **CSRF Protection** - SameSite cookies + CSRF tokens
3. **Rate Limiting** - Implement on login/2FA endpoints
4. **Session Expiry** - Auto-logout after 7 days
5. **Secure Password Reset** - SMS-based verification
6. **2FA Backup Codes** - 10 one-time use codes
7. **Audit Logging** - Log all auth events
8. **Input Validation** - Zod schemas for all forms

---

## 📝 Implementation Checklist

### Phase 0: Setup & Structure (Day 1)

**DDD Structure:**
- [ ] Create `src/components/domains/auth/` - Following DDD pattern
  - [ ] `components/` folder
  - [ ] `hooks/` folder
  - [ ] `types/` folder
  - [ ] `utils/` folder
  - [ ] `validation/` folder
  - [ ] `index.ts` barrel export
- [ ] Create `src/components/features/session/` - Session feature
- [ ] Create `src/lib/auth/` - Auth business logic

**Types & Schemas:**
- [ ] Create `src/components/domains/auth/types/auth.types.ts`
  - [ ] AuthUser, LoginCredentials, SignUpData
  - [ ] TwoFactorData, PasswordResetMethod
- [ ] Create `src/components/domains/auth/validation/authSchemas.ts`
  - [ ] loginSchema, signupSchema
  - [ ] passwordResetSchema, totpSchema
- [ ] Create `src/components/features/session/types.ts`
  - [ ] Session, SessionUser

### Phase 1: Core Authentication (Week 1)

**Session Management:**
- [ ] Create `src/components/features/session/SessionProvider.tsx`
- [ ] Create `src/components/features/session/useSession.ts`
- [ ] Create `src/lib/auth/session.ts` - Server-side session utilities
- [ ] Update `src/app/layout.tsx` - Wrap with SessionProvider

**Server Actions:**
- [ ] Create `src/lib/auth/actions.ts`
  - [ ] `loginAction()` - Email/password login
  - [ ] `logoutAction()` - Clear session
  - [ ] `signupAction()` - Create account
  - [ ] `refreshSessionAction()` - Refresh token

**Domain Components:**
- [ ] Create `src/components/domains/auth/components/SignInForm.tsx`
  - [ ] Adapt from `_examples/auth/SignInForm.tsx`
  - [ ] Connect to loginAction
  - [ ] Add Google OAuth button
- [ ] Create `src/components/domains/auth/components/SignUpForm.tsx`
  - [ ] Adapt from `_examples/auth/SignUpForm.tsx`
  - [ ] Connect to signupAction
  - [ ] Password strength component

**Sign In Flow:**
- [ ] Create `src/app/(auth)/layout.tsx` - Auth layout (full-width)
- [ ] Create `src/app/(auth)/signin/page.tsx` - Use SignInForm component
- [ ] Add validation with Zod
- [ ] Handle loading states
- [ ] Show error messages with toast

**Sign Up Flow:**
- [ ] Create `src/app/(auth)/signup/page.tsx` - Use SignUpForm component
- [ ] Add email validation
- [ ] Phone number validation

### Phase 2: 2FA Implementation (Week 1-2)

**2FA Setup:**
- [ ] Create `src/app/(authenticated)/settings/security/page.tsx`
- [ ] Create `src/components/auth/TwoFactorSetup.tsx`
  - [ ] Display QR code
  - [ ] Show backup codes
  - [ ] Verification step
- [ ] Add Server Actions:
  - [ ] `setup2FAAction()` - Generate secret/QR
  - [ ] `enable2FAAction()` - Enable with verification
  - [ ] `disable2FAAction()` - Disable 2FA
  - [ ] `generateBackupCodesAction()` - New backup codes

**2FA Login:**
- [ ] Create `src/app/(auth)/verify-2fa/page.tsx`
- [ ] Create `src/components/auth/TwoFactorVerify.tsx`
  - [ ] 6-digit OTP input
  - [ ] "Lost access?" link
  - [ ] Countdown timer
- [ ] Update `loginAction()` to handle 2FA flow

**2FA Recovery:**
- [ ] Create `src/components/auth/TwoFactorRecovery.tsx`
- [ ] Add Server Actions:
  - [ ] `send2FARecoveryAction()` - Send SMS
  - [ ] `verify2FARecoveryAction()` - Verify SMS code
- [ ] Show backup code option

### Phase 3: Password Reset (Week 2)

**Forgot Password (Email + SMS Options):**
- [ ] Create `src/app/(auth)/forgot-password/page.tsx`
- [ ] Create `src/components/domains/auth/components/ForgotPasswordForm.tsx`
  - [ ] Radio toggle: Email (default) vs SMS
  - [ ] Email input (for email path)
  - [ ] Phone input (for SMS path)
  - [ ] Send button with loading state
- [ ] Create `src/components/domains/auth/utils/passwordHelpers.ts`
  - [ ] formatPhone, validateEmail
- [ ] Add Server Actions:
  - [ ] `forgotPasswordEmailAction()` - Send email with OTT link
  - [ ] `forgotPasswordSMSAction()` - Send SMS code

**Reset Password:**
- [ ] Create `src/app/(auth)/reset-password/page.tsx`
  - [ ] Handle URL params (token for email path)
  - [ ] Show different UI based on method
- [ ] Create `src/components/domains/auth/components/ResetPasswordForm.tsx`
  - [ ] Email path: Just password inputs (token in URL)
  - [ ] SMS path: Code input + password inputs
  - [ ] Password strength indicator
  - [ ] Confirm password validation
- [ ] Add Server Actions:
  - [ ] `resetPasswordAction()` - Reset with OTT token (email)
  - [ ] `resetPasswordSMSAction()` - Reset with SMS code

### Phase 4: Protected Routes & Middleware (Week 2)

**Middleware:**
- [ ] Create `src/middleware.ts` - Next.js middleware
  - [ ] Check authentication
  - [ ] Redirect unauthenticated users
  - [ ] Handle role-based access
- [ ] Define protected route patterns

**Auth Guards:**
- [ ] Create `src/lib/auth/guards.ts`
  - [ ] `requireAuth()` - Server Component guard
  - [ ] `requireRole()` - Role-based guard
- [ ] Apply to protected pages

### Phase 5: OAuth Integration (Week 2-3)

**Google OAuth:**
- [ ] Create `src/app/(auth)/auth/google/callback/page.tsx`
- [ ] Add Server Actions:
  - [ ] `googleLoginAction()` - Initiate OAuth
  - [ ] `googleCallbackAction()` - Handle callback
- [ ] Update SignInForm with Google button

**X (Twitter) OAuth (Optional):**
- [ ] Similar to Google OAuth flow

### Phase 6: UX Enhancements (Week 3)

**Loading States:**
- [ ] Add skeletons for forms
- [ ] Show loading spinners
- [ ] Disable buttons while submitting

**Error Handling:**
- [ ] Toast notifications for errors
- [ ] Inline field validation
- [ ] Clear error messages

**Success States:**
- [ ] Success messages
- [ ] Smooth redirects
- [ ] Celebration animations (optional)

**Accessibility:**
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management
- [ ] ARIA labels

### Phase 7: Testing & Polish (Week 3)

**Testing:**
- [ ] Test all happy paths
- [ ] Test error scenarios
- [ ] Test 2FA flows
- [ ] Test password reset
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

**Documentation:**
- [ ] Update README with auth docs
- [ ] Add code comments
- [ ] Create troubleshooting guide

---

## 🎨 UX Enhancements

### 1. Progressive Disclosure
- Don't overwhelm users with options
- Show 2FA setup after first login
- Guide users step-by-step

### 2. Smart Defaults
- "Remember me" checked by default
- Auto-focus on first input
- Auto-submit OTP when complete

### 3. Helpful Feedback
- Password strength indicator
- Real-time validation
- Clear error messages
- Success animations

### 4. Mobile-First
- Large touch targets
- Optimized for one-handed use
- Native-feeling inputs

### 5. Dark Mode Support
- All components work in dark mode
- Use existing TailAdmin theme

---

## 🔐 Security Best Practices

1. **Never store tokens in localStorage** - Use httpOnly cookies
2. **Validate all inputs** - Use Zod schemas
3. **Rate limit sensitive endpoints** - Prevent brute force
4. **Log auth events** - Audit trail
5. **Use HTTPS only** - In production
6. **Implement CSRF protection** - SameSite cookies
7. **Hash passwords** - Done by API (bcrypt)
8. **Expire sessions** - 7-day max
9. **Require 2FA for admins** - Policy enforcement
10. **Regular security audits** - Review code regularly

---

## 📊 Success Metrics

1. **Login Success Rate** - > 95%
2. **2FA Adoption** - > 60%
3. **Password Reset Completion** - > 80%
4. **Time to Login** - < 5 seconds
5. **Error Rate** - < 5%

---

## 🚀 Next Steps

1. **Review this plan** - Get approval
2. **Start with Phase 1** - Core authentication
3. **Build incrementally** - One flow at a time
4. **Test thoroughly** - Each phase
5. **Iterate based on feedback** - Continuous improvement

---

## 📚 Technical Stack

- **Frontend:** React 19, Next.js 15
- **Styling:** TailwindCSS (TailAdmin theme)
- **State:** React Context + React Query
- **Forms:** React Hook Form + Zod
- **API Client:** openapi-fetch (type-safe)
- **Session:** httpOnly cookies
- **2FA:** TOTP (Time-based One-Time Password)
- **Password Reset:** Email OTT or SMS code
- **Email:** Handled by backend (already integrated)
- **SMS:** Handled by backend API

---

## 🔧 API Modifications Needed

The API already has **most** of what we need! Here's what to add/modify:

### Already Available ✅
- ✅ Email-based password reset (`/auth/password/forgot`, `/auth/password/reset`)
- ✅ SMS code sending (`/auth/phone/send-code`)
- ✅ SMS code verification (`/auth/phone/verify-code`)
- ✅ 2FA setup and verification (all endpoints)
- ✅ Google OAuth
- ✅ Login/Logout
- ✅ OTT (One-Time Token) system

### Needs Modification 🔨

**1. Password Reset with SMS Code**
Currently, `/auth/phone/verify-code` only verifies the code. We need to:
- Add password reset capability to this endpoint
- Accept `newPassword` field when used for password reset
- Or create new endpoint: `POST /auth/password/reset-sms`

**Location:** `internal/controller/http/v1/users.go`

```go
// Add to existing verify-code or create new endpoint
func (r *UsersV1) resetPasswordWithSMS(ctx *fiber.Ctx) error {
    var body struct {
        Phone       string `json:"phone" validate:"required"`
        Code        string `json:"code" validate:"required,len=6"`
        NewPassword string `json:"newPassword" validate:"required,min=8"`
    }

    // Verify SMS code
    // Reset password
    // Return success
}
```

**2. Login Response - Add 2FA Status**
Currently, login might not indicate if user needs 2FA. Ensure response includes:

```go
type LoginResponse struct {
    Token         *string `json:"token,omitempty"`
    Requires2FA   bool    `json:"requires2FA"`
    TempToken     *string `json:"tempToken,omitempty"` // For 2FA flow
    User          *User   `json:"user,omitempty"`
}
```

**3. User Registration - Return Full Session**
After signup, automatically log the user in:

```go
// POST /auth/signup should return same as login
type SignUpResponse struct {
    Token string `json:"token"`
    User  User   `json:"user"`
}
```

### Optional Enhancements 💡

**1. Rate Limiting**
- Limit login attempts: 5 per 15 minutes per IP
- Limit OTP sends: 3 per hour per user
- Limit password reset: 3 per hour per email/phone

**2. Audit Logging**
- Log all auth events (login, logout, 2FA, password reset)
- Track failed attempts
- Alert on suspicious activity

**3. Email Templates**
- Beautiful HTML email for password reset
- Include expiry time (30 minutes)
- Brand with Thiam logo

---

## 📋 API Implementation Tasks

### Required Changes (Critical Path)
- [ ] Add `POST /auth/password/reset-sms` endpoint
  - [ ] Accept phone, code, newPassword
  - [ ] Verify SMS code
  - [ ] Hash and save new password
  - [ ] Return success message
- [ ] Update login response to include `requires2FA` flag
- [ ] Update signup to return auth token + user

### Optional Improvements
- [ ] Add rate limiting to auth endpoints
- [ ] Implement audit logging for auth events
- [ ] Create HTML email template for password reset
- [ ] Add email OTT expiry (30 minutes)
- [ ] Add SMS code expiry (10 minutes)

---

**This plan creates a production-ready, secure, user-friendly authentication system! 🎉**

**Total Timeline: 3 weeks** (frontend + backend modifications)
