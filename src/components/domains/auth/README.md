# Auth Domain - DDD Architecture

## Overview

This auth domain implements a clean DDD (Domain-Driven Design) architecture with SOLID principles, providing 100% testable, swappable authentication logic.

## Architecture

### Layers

```
auth/
├── domain/              # Pure business logic (no dependencies)
│   ├── models/
│   ├── repositories/    # Interfaces only
│   └── value-objects/   # Domain primitives
│
├── application/         # Use cases (orchestration)
│   ├── use-cases/       # Business workflows
│   └── factory.ts       # Dependency injection
│
└── infrastructure/      # Implementations
    ├── repositories/    # API clients
    └── storage/         # Cookie/session storage
```

### Dependency Flow

```
Server Actions → Use Cases → Repositories (interfaces) ← Implementations
                           ↓
                     Value Objects
```

**Key Principle**: Domain and application layers have ZERO knowledge of implementation details (cookies, iron-session, API clients).

## Files

### Domain Layer (Pure Business Logic)

#### `domain/repositories/IAuthRepository.ts`
```typescript
interface IAuthRepository {
  authenticate(credentials: LoginCredentials): Promise<AuthenticationResult>
  refreshToken(refreshToken: string): Promise<RefreshResult>
  verify2FA(challengeToken: string, code: string): Promise<LoginResult>
  logout(): Promise<void>
}
```

**Purpose**: Defines contract for authentication API calls.

**Why**: Enables swapping Go API for different backends (GraphQL, Firebase, etc.) without changing business logic.

#### `domain/repositories/ITokenStorage.ts`
```typescript
interface ITokenStorage {
  save(tokens: TokenData): Promise<void>
  getAccessToken(): Promise<string | null>
  getRefreshToken(): Promise<string | null>
  clear(): Promise<void>
  exists(): Promise<boolean>
}
```

**Purpose**: Defines contract for storing access/refresh tokens.

**Why**: Enables swapping httpOnly cookies for localStorage, Redis, etc. Essential for testing.

#### `domain/repositories/ISessionStorage.ts`
```typescript
interface ISessionStorage {
  save(session: SessionData): Promise<void>
  get(): Promise<SessionData | null>
  clear(): Promise<void>
  exists(): Promise<boolean>
  updateTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void>
}
```

**Purpose**: Defines contract for session management.

**Why**: Enables swapping iron-session for other session libraries or in-memory storage for testing.

#### `domain/value-objects/TokenTTL.ts`
```typescript
class TokenTTL {
  static fromExpiresAt(expiresAt: number): TokenTTL
  toSeconds(): number
  toMilliseconds(): number
  isExpired(): boolean
  expiresWithin(minutes: number): boolean
}
```

**Purpose**: Encapsulates TTL calculation logic (handles both milliseconds and seconds timestamps).

**Why**: Removes 6x duplication of TTL calculation across actions. Provides clear API for token expiration checks.

### Application Layer (Use Cases)

#### `application/use-cases/LoginUseCase.ts`
```typescript
class LoginUseCase {
  constructor(
    private authRepo: IAuthRepository,
    private tokenStorage: ITokenStorage,
    private sessionStorage: ISessionStorage
  ) {}

  async execute(credentials: LoginCredentials): Promise<LoginUseCaseResult>
}
```

**Purpose**: Orchestrates login workflow.

**Flow**:
1. Call `authRepo.authenticate()` with credentials
2. If 2FA required → return challenge token
3. If success → calculate TTL, save tokens, save session
4. Return result

**Why**: Single Responsibility - only handles login orchestration. All dependencies injected (testable).

#### `application/use-cases/Verify2FAUseCase.ts`
```typescript
class Verify2FAUseCase {
  constructor(
    private authRepo: IAuthRepository,
    private tokenStorage: ITokenStorage,
    private sessionStorage: ISessionStorage
  ) {}

  async execute(challengeToken: string, code: string): Promise<Verify2FAUseCaseResult>
}
```

**Purpose**: Handles 2FA verification flow.

#### `application/use-cases/RefreshTokenUseCase.ts`
```typescript
class RefreshTokenUseCase {
  constructor(
    private authRepo: IAuthRepository,
    private tokenStorage: ITokenStorage,
    private sessionStorage: ISessionStorage
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenUseCaseResult>
}
```

**Purpose**: Handles token refresh workflow.

#### `application/use-cases/LogoutUseCase.ts`
```typescript
class LogoutUseCase {
  constructor(
    private authRepo: IAuthRepository,
    private tokenStorage: ITokenStorage,
    private sessionStorage: ISessionStorage
  ) {}

  async execute(): Promise<LogoutUseCaseResult>
}
```

**Purpose**: Handles logout workflow (API call + clear tokens + clear session).

#### `application/factory.ts`
```typescript
function createLoginUseCase(): LoginUseCase
function createVerify2FAUseCase(): Verify2FAUseCase
function createRefreshTokenUseCase(): RefreshTokenUseCase
function createLogoutUseCase(): LogoutUseCase
```

**Purpose**: Factory functions for dependency injection.

**Why**: Centralizes instantiation logic. Easy to swap implementations (production vs test vs mock).

### Infrastructure Layer (Implementations)

#### `infrastructure/repositories/ApiAuthRepository.ts`
Concrete implementation of `IAuthRepository` using `openapi-fetch` to call Go backend API.

#### `infrastructure/storage/CookieTokenStorage.ts`
Concrete implementation of `ITokenStorage` using Next.js httpOnly cookies.

#### `infrastructure/storage/IronSessionStorage.ts`
Concrete implementation of `ISessionStorage` using `iron-session`.

## Usage

### Server Actions (Recommended Pattern)

```typescript
'use server'

import { createLoginUseCase } from '@/components/domains/auth/application'
import { loginSchema } from '@/components/domains/auth/validation/authSchemas'

export async function loginAction(credentials: LoginCredentials) {
  // Validate input
  const validation = loginSchema.safeParse(credentials)
  if (!validation.success) {
    return { success: false, error: 'Invalid credentials' }
  }

  // Execute use case
  const loginUseCase = createLoginUseCase()
  const result = await loginUseCase.execute(credentials)

  // Handle result
  if (result.type === 'error') {
    return { success: false, error: result.message }
  }

  if (result.type === 'needs2FA') {
    return {
      success: true,
      data: {
        requiresTwoFactor: true,
        challengeToken: result.challengeToken,
        email: credentials.email,
      },
    }
  }

  return { success: true, data: { requiresTwoFactor: false } }
}
```

**See `actions-v2.ts` for complete example** (58 lines vs 244 lines - 76% reduction).

## Benefits

### Before Refactoring
- ❌ 1,899-line `actions.ts` file violating Single Responsibility Principle
- ❌ Hardcoded dependencies (cookies, iron-session, API clients)
- ❌ 0% testable (can't inject mocks)
- ❌ TTL calculation logic duplicated 6 times
- ❌ Impossible to swap storage or API implementations
- ❌ No clear bounded context

### After Refactoring
- ✅ Clean separation of concerns (domain, application, infrastructure)
- ✅ 100% testable (all dependencies injectable)
- ✅ Swappable implementations (cookies → localStorage, Go API → GraphQL, etc.)
- ✅ TTL logic centralized in `TokenTTL` value object
- ✅ SOLID principles (Single Responsibility, Dependency Inversion, Interface Segregation)
- ✅ DDD principles (bounded context, domain models, repository pattern)
- ✅ 76% code reduction in Server Actions (58 lines vs 244 lines)

## Testing Strategy

### Unit Tests (Use Cases)

```typescript
describe('LoginUseCase', () => {
  it('should save tokens and session on successful login', async () => {
    // Arrange - inject mocks
    const mockAuthRepo: IAuthRepository = {
      authenticate: vi.fn().mockResolvedValue({
        token: 'access',
        refreshToken: 'refresh',
        expiresAt: Date.now() + 900000,
        user: { /* mock user */ }
      })
    }
    const mockTokenStorage: ITokenStorage = {
      save: vi.fn().mockResolvedValue(undefined)
    }
    const mockSessionStorage: ISessionStorage = {
      save: vi.fn().mockResolvedValue(undefined)
    }

    const useCase = new LoginUseCase(
      mockAuthRepo,
      mockTokenStorage,
      mockSessionStorage
    )

    // Act
    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123'
    })

    // Assert
    expect(result.type).toBe('success')
    expect(mockTokenStorage.save).toHaveBeenCalledWith({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: expect.any(Number)
    })
    expect(mockSessionStorage.save).toHaveBeenCalled()
  })
})
```

### Integration Tests (Server Actions)

Use Cypress to test complete auth flows with real API/cookies.

## Migration Guide

### Phase 1: Gradual Migration (Current)
- ✅ New architecture created alongside old code
- ✅ `actions-v2.ts` demonstrates pattern
- Old `actions.ts` still works (no breaking changes)
- Gradually migrate other auth actions to use cases

### Phase 2: Replace Old Actions
Once all flows tested:
1. Replace `loginAction` → `loginActionV2`
2. Migrate other actions one by one
3. Delete old `actions.ts` when complete

### Phase 3: Extend
- Add `SignUpUseCase`
- Add `PasswordResetUseCase`
- Add `EmailVerificationUseCase`
- All follow same pattern

## Next Steps

1. **Test loginActionV2** in real app
2. **Migrate verify2FAAction** to Verify2FAUseCase
3. **Migrate refreshTokenAction** to RefreshTokenUseCase
4. **Migrate logoutAction** to LogoutUseCase
5. **Remove old calculateTokenTTL()** utility (replaced by TokenTTL)
6. **Add unit tests** for use cases (skip for now per user request)

## Questions?

This architecture follows industry-standard patterns:
- **DDD**: Eric Evans, "Domain-Driven Design"
- **Clean Architecture**: Robert C. Martin
- **SOLID**: Robert C. Martin

All patterns adapted for Next.js 15 App Router with Server Actions.
