/**
 * Custom Cypress Commands for Auth Testing
 */

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in via UI
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>

      /**
       * Custom command to log in programmatically (faster for tests)
       * @example cy.loginByApi('user@example.com', 'password123')
       */
      loginByApi(email: string, password: string): Chainable<void>

      /**
       * Custom command to create a user account
       * @example cy.signup({ email: 'new@example.com', password: 'pass', firstName: 'Test', lastName: 'User' })
       */
      signup(userData: {
        email: string
        password: string
        firstName: string
        lastName: string
        accountType?: string
      }): Chainable<void>

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>

      /**
       * Custom command to check if user is authenticated
       * @example cy.checkAuth()
       */
      checkAuth(): Chainable<boolean>

      /**
       * Custom command to mock authentication
       * @example cy.mockAuth({ email: 'test@example.com', role: 'admin' })
       */
      mockAuth(user: {
        id?: string
        email: string
        firstName?: string
        lastName?: string
        role?: string
      }): Chainable<void>

      /**
       * Custom command to navigate with keyboard (tab key)
       * @example cy.get('input').tab()
       */
      tab(): Chainable<Element>
    }
  }
}

// Login via UI
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/en/signin')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Login programmatically via API
Cypress.Commands.add('loginByApi', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/login`,
    body: {
      email,
      password,
    },
  }).then((response) => {
    // Store the session cookie or token
    if (response.body.token) {
      cy.setCookie('session', response.body.token)
    }
  })
})

// Sign up via UI
Cypress.Commands.add(
  'signup',
  (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    accountType?: string
  }) => {
    cy.visit('/en/signup')
    cy.get('input[name="firstName"]').type(userData.firstName)
    cy.get('input[name="lastName"]').type(userData.lastName)
    cy.get('input[name="email"]').type(userData.email)
    cy.get('input[name="password"]').type(userData.password)
    cy.get('input[name="confirmPassword"]').type(userData.password)

    if (userData.accountType) {
      cy.get(`input[value="${userData.accountType}"]`).check()
    }

    cy.get('input[name="terms"]').check()
    cy.get('button[type="submit"]').click()
  }
)

// Logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.contains('Logout').click()
})

// Check if authenticated
Cypress.Commands.add('checkAuth', () => {
  return cy
    .request({
      url: '/api/session',
      failOnStatusCode: false,
    })
    .then((response) => {
      return response.status === 200 && response.body.user
    })
})

// Mock authentication
Cypress.Commands.add(
  'mockAuth',
  (user: {
    id?: string
    email: string
    firstName?: string
    lastName?: string
    role?: string
  }) => {
    const mockUser = {
      id: user.id || '1',
      email: user.email,
      firstName: user.firstName || 'Test',
      lastName: user.lastName || 'User',
      role: user.role || 'customer',
      accountType: 'customer',
    }

    const mockSession = {
      user: mockUser,
      token: 'mock-jwt-token',
      expiresAt: Date.now() + 3600000,
    }

    // Intercept session check
    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: mockSession,
    })

    // Set session cookie
    cy.setCookie('session', JSON.stringify(mockSession))
  }
)

// Tab navigation (for accessibility testing)
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  if (subject) {
    cy.wrap(subject).trigger('keydown', { key: 'Tab', keyCode: 9 })
    return cy.focused()
  } else {
    cy.focused().trigger('keydown', { key: 'Tab', keyCode: 9 })
    return cy.focused()
  }
})

// Prevent TypeScript errors
export {}
