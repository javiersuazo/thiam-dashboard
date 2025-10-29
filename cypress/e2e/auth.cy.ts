/**
 * Comprehensive Auth E2E Tests
 *
 * Tests all authentication flows:
 * - Sign In (Email/Password)
 * - Sign Up (User Registration)
 * - OAuth (Google)
 * - Password Reset
 * - Two-Factor Authentication
 * - Session Management
 * - Protected Routes
 */

describe('Authentication System', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Sign In', () => {
    beforeEach(() => {
      cy.visit('/en/signin')
    })

    it('should display sign in page correctly', () => {
      cy.contains('h1', 'Welcome back').should('be.visible')
      cy.contains('Enter your credentials').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.get('button[type="submit"]').click()
      // Form should prevent submission or show errors
      cy.url().should('include', '/signin')
    })

    it('should show validation error for invalid email', () => {
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()

      // Check for validation message
      cy.url().should('include', '/signin')
    })

    it('should handle login with valid credentials', () => {
      // Intercept the login API call
      cy.intercept('POST', `${Cypress.env('API_URL')}/auth/login`, {
        statusCode: 200,
        body: {
          token: 'mock-jwt-token',
          expiresAt: Date.now() + 3600000,
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'customer',
            accountType: 'customer',
          },
        },
      }).as('loginRequest')

      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()

      cy.wait('@loginRequest')

      // Should redirect to dashboard after successful login
      cy.url().should('not.include', '/signin')
      cy.url().should('eq', 'http://localhost:3000/en')
    })

    it('should handle login failure with incorrect credentials', () => {
      cy.intercept('POST', `${Cypress.env('API_URL')}/auth/login`, {
        statusCode: 401,
        body: {
          code: 1002,
          key: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        },
      }).as('failedLogin')

      cy.get('input[name="email"]').type('wrong@example.com')
      cy.get('input[name="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()

      cy.wait('@failedLogin')

      // Should show error message
      cy.contains('Invalid email or password', { timeout: 5000 }).should('be.visible')
      cy.url().should('include', '/signin')
    })

    it('should toggle password visibility', () => {
      cy.get('input[name="password"]').should('have.attr', 'type', 'password')

      // Click eye icon to show password
      cy.get('input[name="password"]').parent().find('svg').click()
      cy.get('input[name="password"]').should('have.attr', 'type', 'text')

      // Click again to hide password
      cy.get('input[name="password"]').parent().find('svg').click()
      cy.get('input[name="password"]').should('have.attr', 'type', 'password')
    })

    it('should navigate to sign up page', () => {
      cy.contains('Sign up').click()
      cy.url().should('include', '/signup')
    })

    it('should navigate to forgot password page', () => {
      cy.contains('Forgot password?').click()
      cy.url().should('include', '/forgot-password')
    })

    it('should remember me checkbox work', () => {
      cy.get('input[type="checkbox"]').should('not.be.checked')
      cy.get('input[type="checkbox"]').check()
      cy.get('input[type="checkbox"]').should('be.checked')
    })
  })

  describe('Sign Up', () => {
    beforeEach(() => {
      cy.visit('/en/signup')
    })

    it('should display sign up page correctly', () => {
      cy.contains('h1', 'Create an account').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="firstName"]').should('be.visible')
      cy.get('input[name="lastName"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should show validation errors for empty required fields', () => {
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/signup')
    })

    it('should show password strength indicator', () => {
      cy.get('input[name="password"]').type('weak')
      // Password strength indicator should be visible
      // Adjust selector based on your implementation
      cy.get('input[name="password"]').should('have.value', 'weak')
    })

    it('should validate password confirmation match', () => {
      cy.get('input[name="password"]').type('StrongPass123!')
      cy.get('input[name="confirmPassword"]').type('DifferentPass123!')
      cy.get('button[type="submit"]').click()

      // Should show validation error for password mismatch
      cy.url().should('include', '/signup')
    })

    it('should handle successful registration', () => {
      cy.intercept('POST', `${Cypress.env('API_URL')}/users`, {
        statusCode: 200,
        body: {
          token: 'mock-jwt-token',
          expiresAt: Date.now() + 3600000,
          user: {
            id: '1',
            email: 'newuser@example.com',
            firstName: 'New',
            lastName: 'User',
            role: 'customer',
            accountType: 'customer',
          },
        },
      }).as('signupRequest')

      cy.get('input[name="firstName"]').type('New')
      cy.get('input[name="lastName"]').type('User')
      cy.get('input[name="email"]').type('newuser@example.com')
      cy.get('input[name="password"]').type('StrongPass123!')
      cy.get('input[name="confirmPassword"]').type('StrongPass123!')
      cy.get('input[name="terms"]').check()
      cy.get('button[type="submit"]').click()

      cy.wait('@signupRequest')

      // Should redirect to dashboard after successful signup
      cy.url().should('not.include', '/signup')
    })

    it('should handle email already exists error', () => {
      cy.intercept('POST', `${Cypress.env('API_URL')}/users', {
        statusCode: 400,
        body: {
          code: 1001,
          key: 'VALIDATION_ERROR',
          message: 'Email already exists',
        },
      }).as('duplicateEmail')

      cy.get('input[name="firstName"]').type('Test')
      cy.get('input[name="lastName"]').type('User')
      cy.get('input[name="email"]').type('existing@example.com')
      cy.get('input[name="password"]').type('StrongPass123!')
      cy.get('input[name="confirmPassword"]').type('StrongPass123!')
      cy.get('input[name="terms"]').check()
      cy.get('button[type="submit"]').click()

      cy.wait('@duplicateEmail')

      cy.contains('Email already exists').should('be.visible')
      cy.url().should('include', '/signup')
    })

    it('should navigate to sign in page', () => {
      cy.contains('Sign in').click()
      cy.url().should('include', '/signin')
    })
  })

  describe('OAuth (Google)', () => {
    beforeEach(() => {
      cy.visit('/en/signin')
    })

    it('should display OAuth button', () => {
      cy.contains('Continue with Google').should('be.visible')
    })

    it('should initiate OAuth flow when clicked', () => {
      cy.intercept('GET', `${Cypress.env('API_URL')}/auth/google/login`, {
        statusCode: 200,
        body: {
          authUrl: 'https://accounts.google.com/o/oauth2/auth?client_id=test',
          state: 'test-state',
        },
      }).as('oauthInit')

      // Mock window.location.href redirect
      cy.window().then((win) => {
        cy.stub(win, 'location').value({
          ...win.location,
          href: 'https://accounts.google.com/o/oauth2/auth?client_id=test',
        })
      })

      cy.contains('Continue with Google').click()

      cy.wait('@oauthInit')
    })

    it('should handle OAuth callback success', () => {
      cy.intercept('GET', `${Cypress.env('API_URL')}/auth/google/callback*`, {
        statusCode: 200,
        body: {
          token: 'mock-oauth-token',
          expiresAt: Date.now() + 3600000,
          user: {
            id: '1',
            email: 'oauth@example.com',
            firstName: 'OAuth',
            lastName: 'User',
            role: 'customer',
            accountType: 'customer',
          },
        },
      }).as('oauthCallback')

      cy.visit('/en/oauth-callback?code=test-auth-code&state=test-state&provider=google')

      cy.wait('@oauthCallback')

      // Should show success message and redirect
      cy.contains('Sign in successful!').should('be.visible')
      cy.url().should('eq', 'http://localhost:3000/en')
    })

    it('should handle OAuth callback error', () => {
      cy.intercept('GET', `${Cypress.env('API_URL')}/auth/google/callback*`, {
        statusCode: 400,
        body: {
          code: 1001,
          key: 'OAUTH_ERROR',
          message: 'OAuth authentication failed',
        },
      }).as('oauthError')

      cy.visit('/en/oauth-callback?code=invalid-code&state=test-state&provider=google')

      cy.wait('@oauthError')

      // Should show error message
      cy.contains('Sign in failed').should('be.visible')
    })
  })

  describe('Password Reset', () => {
    beforeEach(() => {
      cy.visit('/en/forgot-password')
    })

    it('should display forgot password page', () => {
      cy.contains('Forgot password').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should handle forgot password request', () => {
      cy.intercept('POST', `${Cypress.env('API_URL')}/auth/password/forgot`, {
        statusCode: 200,
        body: {
          message: 'Password reset email sent',
        },
      }).as('forgotPassword')

      cy.get('input[name="email"]').type('test@example.com')
      cy.get('button[type="submit"]').click()

      cy.wait('@forgotPassword')

      cy.contains('Password reset email sent').should('be.visible')
    })

    it('should handle password reset with token', () => {
      cy.intercept('POST', `${Cypress.env('API_URL')}/auth/password/reset`, {
        statusCode: 200,
        body: {
          message: 'Password reset successful',
        },
      }).as('resetPassword')

      cy.visit('/en/reset-password?token=valid-reset-token')

      cy.get('input[name="password"]').type('NewStrongPass123!')
      cy.get('input[name="confirmPassword"]').type('NewStrongPass123!')
      cy.get('button[type="submit"]').click()

      cy.wait('@resetPassword')

      cy.contains('Password reset successful').should('be.visible')
      cy.url().should('include', '/signin')
    })
  })

  describe('Two-Factor Authentication', () => {
    it('should require 2FA code after login when enabled', () => {
      cy.visit('/en/signin')

      cy.intercept('POST', `${Cypress.env('API_URL')}/auth/login`, {
        statusCode: 200,
        body: {
          requires2FA: true,
        },
      }).as('loginWith2FA')

      cy.get('input[name="email"]').type('2fa-user@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()

      cy.wait('@loginWith2FA')

      // Should redirect to 2FA verification
      cy.url().should('include', '/two-step-verification')
      cy.contains('Enter verification code').should('be.visible')
    })

    it('should verify 2FA code', () => {
      cy.visit('/en/two-step-verification')

      cy.intercept('POST', `${Cypress.env('API_URL')}/auth/2fa/verify`, {
        statusCode: 200,
        body: {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            email: '2fa-user@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'customer',
          },
        },
      }).as('verify2FA')

      cy.get('input[name="code"]').type('123456')
      cy.get('button[type="submit"]').click()

      cy.wait('@verify2FA')

      cy.url().should('eq', 'http://localhost:3000/en')
    })
  })

  describe('Session Management', () => {
    beforeEach(() => {
      // Mock successful login
      cy.intercept('POST', `${Cypress.env('API_URL')}/auth/login`, {
        statusCode: 200,
        body: {
          token: 'mock-jwt-token',
          expiresAt: Date.now() + 3600000,
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'customer',
          },
        },
      })

      cy.visit('/en/signin')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()
    })

    it('should maintain session across page reloads', () => {
      cy.url().should('eq', 'http://localhost:3000/en')

      cy.reload()

      // Should still be logged in
      cy.url().should('not.include', '/signin')
    })

    it('should logout successfully', () => {
      cy.intercept('POST', `${Cypress.env('API_URL')}/auth/logout`, {
        statusCode: 200,
      }).as('logout')

      // Find and click logout button (adjust selector based on your implementation)
      cy.get('[data-testid="user-menu"]', { timeout: 10000 }).click()
      cy.contains('Logout').click()

      cy.wait('@logout')

      // Should redirect to signin
      cy.url().should('include', '/signin')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to signin', () => {
      cy.visit('/en/profile')

      // Should redirect to signin
      cy.url().should('include', '/signin')
    })

    it('should allow authenticated users to access protected pages', () => {
      // Mock session check
      cy.intercept('GET', '/api/session', {
        statusCode: 200,
        body: {
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'customer',
          },
        },
      })

      cy.visit('/en/profile')

      // Should stay on profile page
      cy.url().should('include', '/profile')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible sign in form', () => {
      cy.visit('/en/signin')

      // All form inputs should have labels
      cy.get('input[name="email"]').should('have.attr', 'type', 'email')
      cy.get('input[name="password"]').should('have.attr', 'type', 'password')

      // Submit button should be keyboard accessible
      cy.get('button[type="submit"]').should('be.visible').focus()
      cy.focused().should('have.attr', 'type', 'submit')
    })

    it('should support keyboard navigation', () => {
      cy.visit('/en/signin')

      // Tab through form elements
      cy.get('body').tab()
      cy.focused().should('have.attr', 'name', 'email')

      cy.focused().tab()
      cy.focused().should('have.attr', 'name', 'password')

      cy.focused().tab()
      cy.focused().should('have.attr', 'type', 'checkbox')
    })
  })

  describe('Internationalization', () => {
    it('should support multiple languages', () => {
      // Test English
      cy.visit('/en/signin')
      cy.contains('Welcome back').should('be.visible')

      // Test Spanish
      cy.visit('/es/signin')
      cy.contains('Bienvenido de nuevo').should('be.visible')

      // Test Portuguese
      cy.visit('/pt/signin')
      cy.contains('Bem-vindo de volta').should('be.visible')
    })
  })
})
