import { generateDeterministicEmailToken } from '../helpers/auth.helpers'

declare global {
  namespace Cypress {
    interface Chainable {
      registerUserViaUI(userData: RegisterUserData): Chainable<void>
      registerUserViaAPI(userData: RegisterUserData): Chainable<void>
      verifyEmailWithToken(email: string): Chainable<void>
      loginViaUI(email: string, password: string): Chainable<void>
      loginViaAPI(email: string, password: string): Chainable<void>
    }
  }
}

interface RegisterUserData {
  email: string
  password: string
  confirmPassword?: string
  firstName: string
  lastName: string
  accountName: string
  accountType?: 'customer' | 'caterer' | 'partner'
  phone?: string
}

const API_URL = Cypress.env('API_URL') || 'http://localhost:8080/api/v1'

Cypress.Commands.add('registerUserViaUI', (userData: RegisterUserData) => {
  cy.visit('/signup')

  cy.get('input[name="firstName"]').type(userData.firstName)
  cy.get('input[name="lastName"]').type(userData.lastName)
  cy.get('input[name="email"]').type(userData.email)

  if (userData.phone) {
    cy.get('input[name="phone"]').type(userData.phone)
  }

  cy.get('input[name="password"]').type(userData.password)
  cy.get('input[name="confirmPassword"]').type(userData.confirmPassword || userData.password)

  // Accept terms checkbox
  cy.get('input[type="checkbox"]').check({ force: true })

  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('registerUserViaAPI', (userData: RegisterUserData) => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/auth/register`,
    body: {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      account_name: userData.accountName,
      account_type: userData.accountType || 'customer',
      ...(userData.phone && { phone: userData.phone }),
    },
  }).then((response) => {
    expect(response.status).to.eq(201)
    expect(response.body).to.have.property('user_id')
    expect(response.body).to.have.property('account_id')
  })
})

Cypress.Commands.add('verifyEmailWithToken', (email: string) => {
  const token = generateDeterministicEmailToken(email)

  cy.request({
    method: 'POST',
    url: `${API_URL}/auth/email-verification/verify`,
    body: { token },
  }).then((response) => {
    expect(response.status).to.eq(200)
  })
})

Cypress.Commands.add('loginViaUI', (email: string, password: string) => {
  cy.visit('/signin')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()

  // Wait for redirect to dashboard
  cy.url().should('match', /\/(dashboard|home)/, { timeout: 10000 })

  // Verify cookies are set
  cy.getCookie('access_token').should('exist')
})

Cypress.Commands.add('loginViaAPI', (email: string, password: string) => {
  return cy.request({
    method: 'POST',
    url: `${API_URL}/auth/login`,
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body).to.have.property('access_token')
    expect(response.body).to.have.property('refresh_token')
    expect(response.body).to.have.property('user_id')

    return {
      user_id: response.body.user_id,
      accessToken: response.body.access_token,
      refreshToken: response.body.refresh_token,
      email: response.body.email,
    }
  })
})
