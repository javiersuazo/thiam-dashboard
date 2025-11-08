/**
 * Cypress E2E Support File
 *
 * This file is processed and loaded automatically before test files.
 * You can change the location of this file or turn off automatically
 * serving support files with the 'supportFile' configuration option.
 */

// Import commands
import './commands'
import './commands/auth.commands'

// Hide fetch/XHR requests in command log for cleaner output
const app = window.top

if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style')
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }'
  style.setAttribute('data-hide-command-log-request', '')

  app.document.head.appendChild(style)
}

// Configure global behavior
beforeEach(() => {
  // Suppress uncaught exceptions that are expected (e.g., network errors)
  cy.on('uncaught:exception', (err) => {
    // Returning false here prevents Cypress from failing the test
    // Add patterns for expected errors
    if (err.message.includes('ResizeObserver')) {
      return false
    }
    if (err.message.includes('Failed to fetch')) {
      return false
    }
    // Let other errors fail the test
    return true
  })
})

// Log console errors for debugging
Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'error')
  cy.spy(win.console, 'warn')
})
