import { generateTestUser, generateDeterministicEmailToken } from '../../support/helpers/auth.helpers'

describe('Authentication: Registration → Verification → Login', () => {
  let testUser: ReturnType<typeof generateTestUser>

  beforeEach(() => {
    testUser = generateTestUser()
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Registration via API + Verification + UI Login', () => {
    it('should register via API, verify, then login via UI', () => {
      // Register via API (faster for setup)
      cy.registerUserViaAPI(testUser)

      // Verify email
      cy.verifyEmailWithToken(testUser.email)

      // Login via UI
      cy.loginViaUI(testUser.email, testUser.password)

      // Should be logged in
      cy.url().should('match', /\/(dashboard|home)/)
      cy.getCookie('access_token').should('exist')
    })
  })

  describe('Error Scenarios', () => {
    it('should show error when logging in without email verification', () => {
      // Register but DON'T verify
      cy.registerUserViaAPI(testUser)

      // Try to login
      cy.visit('/signin')
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()

      // Should NOT be logged in (check behavior, not toast message)
      cy.wait(1000) // Wait for submission to complete
      cy.getCookie('access_token').should('not.exist')

      // Should still be on signin page (not redirected)
      cy.url().should('include', '/signin')
    })

    it('should show error for invalid verification token', () => {
      cy.visit('/verify-email?token=invalid-token-12345')

      // Wait for verification attempt
      cy.wait(1000)

      // Should NOT be redirected to email-verified page
      cy.url().should('not.include', '/email-verified')

      // Should still be on verify-email page or show error
      cy.url().should('include', '/verify-email')
    })

    it('should show error for wrong password', () => {
      // Register and verify
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)

      // Try to login with wrong password
      cy.visit('/signin')
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type('WrongPassword123!')
      cy.get('button[type="submit"]').click()

      // Should NOT be logged in (check behavior, not toast message)
      cy.wait(1000)
      cy.getCookie('access_token').should('not.exist')
      cy.url().should('include', '/signin')
    })

    it('should show error for non-existent user', () => {
      cy.visit('/signin')
      cy.get('input[name="email"]').type('nonexistent@example.com')
      cy.get('input[name="password"]').type('Password123!')
      cy.get('button[type="submit"]').click()

      // Should NOT be logged in (check behavior, not toast message)
      cy.wait(1000)
      cy.getCookie('access_token').should('not.exist')
      cy.url().should('include', '/signin')
    })
  })

  describe('Logout Flow', () => {
    it('should logout and clear authentication', () => {
      // Ignore Next.js redirect exceptions from logout action
      cy.on('uncaught:exception', (err) => {
        if (err.message.includes('NEXT_REDIRECT')) {
          return false
        }
      })

      // Setup: Register, verify, and login
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)
      cy.loginViaUI(testUser.email, testUser.password)

      // Should be on dashboard
      cy.url().should('match', /\/(dashboard|home)/)

      // Verify we're logged in
      cy.getCookie('access_token').should('exist')

      // Open user dropdown menu (usually top right corner)
      // Try different selectors to find the user menu trigger
      cy.get('body').then(($body) => {
        // Look for user menu triggers in priority order
        if ($body.find('[data-testid="user-menu"]').length > 0) {
          cy.get('[data-testid="user-menu"]').click({ force: true })
        } else if ($body.find('header [aria-label="User menu"]').length > 0) {
          cy.get('header [aria-label="User menu"]').click({ force: true })
        } else if ($body.find('header .user-menu').length > 0) {
          cy.get('header .user-menu').click({ force: true })
        } else if ($body.find('header button').length > 0) {
          // Fallback: click the last button in header (usually user menu)
          cy.get('header button').last().click({ force: true })
        }
      })

      // Wait for dropdown to appear
      cy.wait(1000)

      // Click logout option
      cy.contains(/log out|logout|sign out/i).click({ force: true })

      // Should redirect (might be /en, /signin, or /)
      cy.url().should('not.match', /\/(dashboard|home)/, { timeout: 10000 })

      // Cookies should be cleared
      cy.getCookie('access_token').should('not.exist')
      cy.getCookie('refresh_token').should('not.exist')

      // Should not be able to access protected routes - should redirect to signin
      cy.visit('/dashboard')
      cy.url().should('include', '/signin')
    })
  })
})
