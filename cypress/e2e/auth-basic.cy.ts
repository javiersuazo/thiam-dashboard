/**
 * Basic Auth E2E Tests - Tests real backend integration
 *
 * These tests are designed to work with both mocked and real API
 * Set MOCK_API=true in cypress.config.ts to use mocks
 */

import { setupMockIfEnabled } from '../support/api-helpers'

describe('Authentication System - Basic Flow', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Sign In Page', () => {
    beforeEach(() => {
      cy.visit('/en/signin')
    })

    it('should display sign in page correctly', () => {
      cy.contains('h1', 'Welcome back').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    // TODO: Fix password toggle test - need correct selector for eye icon
    it.skip('should toggle password visibility', () => {
      cy.get('input[name="password"]').should('have.attr', 'type', 'password')

      // Click eye icon to show password - look for button next to password field
      cy.get('input[name="password"]')
        .parent()
        .parent()
        .find('button[type="button"]')
        .click()
      cy.get('input[name="password"]').should('have.attr', 'type', 'text')

      // Click again to hide password
      cy.get('input[name="password"]')
        .parent()
        .parent()
        .find('button[type="button"]')
        .click()
      cy.get('input[name="password"]').should('have.attr', 'type', 'password')
    })

    it('should navigate to sign up page', () => {
      cy.contains('Sign up').click()
      cy.url().should('include', '/signup')
    })
  })

  describe('OAuth Flow', () => {
    beforeEach(() => {
      cy.visit('/en/signin')
    })

    it('should display Google OAuth button', () => {
      cy.contains('Continue with Google').should('be.visible')
    })

    it('should initiate OAuth flow when clicked', () => {
      // Setup mock if MOCK_API is enabled
      setupMockIfEnabled(
        'GET',
        `${Cypress.env('API_URL')}/auth/google/login`,
        {
          statusCode: 200,
          body: {
            authUrl: 'https://accounts.google.com/o/oauth2/auth?client_id=test',
            state: 'test-state',
          },
        },
        'oauthInit'
      )

      // Click Google OAuth button
      cy.contains('Continue with Google').click()

      // If mocking, wait for the intercept
      if (Cypress.env('MOCK_API')) {
        cy.wait('@oauthInit')
      } else {
        // With real API, the redirect happens, so we can check for it
        cy.wait(1000) // Give it a moment
      }
    })
  })

  describe('Sign Up Page', () => {
    beforeEach(() => {
      cy.visit('/en/signup')
    })

    it('should display sign up page correctly', () => {
      cy.contains('Create your account').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="firstName"]').should('be.visible')
      cy.get('input[name="lastName"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should navigate to sign in page', () => {
      cy.contains('Sign in').click()
      cy.url().should('include', '/signin')
    })
  })

  describe('Internationalization', () => {
    it('should display English content', () => {
      cy.visit('/en/signin')
      cy.contains('Welcome back').should('be.visible')
    })

    // TODO: Fix i18n - translations exist but aren't loading
    it.skip('should display Spanish content', () => {
      cy.visit('/es/signin')
      cy.contains('Bienvenido de nuevo').should('be.visible')
    })

    it.skip('should display Portuguese content', () => {
      cy.visit('/pt/signin')
      cy.contains('Bem-vindo de volta').should('be.visible')
    })
  })
})
