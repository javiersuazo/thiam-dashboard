/**
 * Helper to conditionally mock API calls based on MOCK_API env variable
 */

export function mockApiCall(
  method: string,
  url: string,
  response: {
    statusCode: number
    body: any
  }
): Cypress.Chainable | void {
  if (Cypress.env('MOCK_API')) {
    return cy.intercept(method, url, response)
  }
  // If not mocking, let the real API handle it
  return undefined
}

export function setupMockIfEnabled(
  method: string,
  url: string,
  response: { statusCode: number; body: any },
  alias?: string
): void {
  if (Cypress.env('MOCK_API')) {
    const intercept = cy.intercept(method, url, response)
    if (alias) {
      intercept.as(alias)
    }
  }
}
