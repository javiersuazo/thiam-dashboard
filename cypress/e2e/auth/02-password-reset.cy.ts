import { generateTestUser, generateDeterministicResetToken } from '../../support/helpers/auth.helpers'

describe('Authentication: Password Reset Flow', () => {
  let testUser: ReturnType<typeof generateTestUser>
  const API_URL = Cypress.env('API_URL') || 'http://localhost:8080/api/v1'

  beforeEach(() => {
    testUser = generateTestUser()
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Complete Password Reset Flow', () => {
    it('should request reset → verify token → set new password → login with new password', () => {
      // ==========================================
      // SETUP: Create and verify user first
      // ==========================================
      cy.log('**Setup: Register and verify user**')

      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)

      // ==========================================
      // STEP 1: REQUEST PASSWORD RESET
      // ==========================================
      cy.log('**Step 1: Request Password Reset**')

      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/password-reset/request`,
        body: {
          email: testUser.email,
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        cy.log('✅ Password reset email sent')
      })

      // ==========================================
      // STEP 2: CALCULATE DETERMINISTIC TOKEN
      // ==========================================
      cy.log('**Step 2: Calculate Deterministic Reset Token**')

      const resetToken = generateDeterministicResetToken(testUser.email)
      cy.log(`Using token: ${resetToken}`)

      // ==========================================
      // STEP 3: RESET PASSWORD WITH TOKEN
      // ==========================================
      cy.log('**Step 3: Reset Password**')

      const newPassword = 'NewPassword123!'

      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/password-reset/reset`,
        body: {
          token: resetToken,
          new_password: newPassword,
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        cy.log('✅ Password reset successful')
      })

      // ==========================================
      // STEP 4: LOGIN WITH NEW PASSWORD
      // ==========================================
      cy.log('**Step 4: Login with New Password**')

      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/login`,
        body: {
          email: testUser.email,
          password: newPassword,
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('access_token')
        expect(response.body).to.have.property('refresh_token')
        cy.log('✅ Successfully logged in with new password')
      })

      // ==========================================
      // STEP 5: VERIFY OLD PASSWORD DOESN'T WORK
      // ==========================================
      cy.log('**Step 5: Verify Old Password Rejected**')

      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/login`,
        body: {
          email: testUser.email,
          password: testUser.password, // Old password
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401)
        cy.log('✅ Old password correctly rejected')
      })

      cy.log('✅ COMPLETE! Password reset flow verified')
    })
  })

  describe('Password Reset via UI', () => {
    it('should reset password through UI flow', () => {
      // Setup: Create and verify user
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)

      // Request password reset via API (faster than UI)
      const API_URL = Cypress.env('API_URL') || 'http://localhost:8080/api/v1'
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/password-reset/request`,
        body: {
          email: testUser.email,
        },
      })

      // Calculate deterministic token
      const resetToken = generateDeterministicResetToken(testUser.email)

      // Visit reset password page with token
      cy.visit(`/reset-password?token=${resetToken}`)

      // Wait for page to load
      cy.get('input[name="newPassword"]').should('be.visible')

      // Enter new password
      const newPassword = 'NewPassword123!'
      cy.get('input[name="newPassword"]').type(newPassword)

      // Wait for password requirements to update
      cy.wait(500)

      cy.get('input[name="confirmPassword"]').type(newPassword)

      // Wait for form to be valid
      cy.wait(500)

      // Submit should be enabled now
      cy.get('button[type="submit"]').should('not.be.disabled')
      cy.get('button[type="submit"]').click()

      // Wait a bit to see if there's an error or redirect
      cy.wait(2000)

      // Check if there's an error message
      cy.get('body').then(($body) => {
        const bodyText = $body.text()
        cy.log(`Page content after submit: ${bodyText}`)

        // Log current URL
        cy.url().then((url) => {
          cy.log(`Current URL: ${url}`)
        })
      })

      // Should redirect to dashboard (auto-login after reset)
      cy.url().should('match', /\/(dashboard|home)/, { timeout: 15000 })
      cy.getCookie('access_token').should('exist')

      cy.log('✅ Password reset successful and user auto-logged in')
    })
  })

  describe('Error Scenarios', () => {
    it('should reject invalid reset token', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/password-reset/reset`,
        body: {
          token: 'invalid-token-12345',
          new_password: 'NewPassword123!',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401])
        cy.log('✅ Invalid token rejected')
      })
    })

    it('should reject reset for non-existent email', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/password-reset/request`,
        body: {
          email: 'nonexistent@example.com',
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Backend might return 200 to avoid email enumeration
        // or 404 if it reveals non-existent users
        expect(response.status).to.be.oneOf([200, 404])
        cy.log('✅ Non-existent email handled')
      })
    })

    it('should reject weak new password', () => {
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)

      const resetToken = generateDeterministicResetToken(testUser.email)

      // First need to request a reset
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/password-reset/request`,
        body: { email: testUser.email },
      })

      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/password-reset/reset`,
        body: {
          token: resetToken,
          new_password: '123', // Too weak
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422])
        cy.log('✅ Weak password rejected')
      })
    })

    it('should prevent token reuse', () => {
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)

      // Request reset
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/password-reset/request`,
        body: { email: testUser.email },
      })

      const resetToken = generateDeterministicResetToken(testUser.email)
      const newPassword = 'NewPassword123!'

      // Use token once
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/password-reset/reset`,
        body: {
          token: resetToken,
          new_password: newPassword,
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
      })

      // Try to use same token again
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/password-reset/reset`,
        body: {
          token: resetToken,
          new_password: 'AnotherPassword123!',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401])
        cy.log('✅ Token reuse prevented')
      })
    })
  })
})
