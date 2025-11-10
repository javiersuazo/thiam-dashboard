import { generateTestUser, generateDeterministicMagicToken, DEV_SMS_CODE } from '../../support/helpers/auth.helpers'

describe('Authentication: Passwordless Login', () => {
  let testUser: ReturnType<typeof generateTestUser>
  const API_URL = Cypress.env('API_URL') || 'http://localhost:8080/api/v1'

  beforeEach(() => {
    testUser = generateTestUser()
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Magic Link Flow', () => {
    it('should send magic link → verify → login without password', () => {
      // ==========================================
      // SETUP: Create and verify user
      // ==========================================
      cy.log('**Setup: Register and verify user**')

      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)

      // ==========================================
      // STEP 1: REQUEST MAGIC LINK
      // ==========================================
      cy.log('**Step 1: Request Magic Link**')

      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/passwordless/magic-link/send`,
        body: {
          email: testUser.email,
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        cy.log('✅ Magic link sent')
      })

      // ==========================================
      // STEP 2: CALCULATE DETERMINISTIC TOKEN
      // ==========================================
      cy.log('**Step 2: Calculate Deterministic Magic Link Token**')

      const magicToken = generateDeterministicMagicToken(testUser.email)
      cy.log(`Using token: ${magicToken}`)

      // ==========================================
      // STEP 3: VERIFY MAGIC LINK AND LOGIN
      // ==========================================
      cy.log('**Step 3: Verify Magic Link**')

      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/passwordless/magic-link/verify`,
        body: {
          token: magicToken,
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('access_token')
        expect(response.body).to.have.property('refresh_token')
        expect(response.body).to.have.property('user_id')
        cy.log('✅ Logged in via magic link')

        const accessToken = response.body.access_token

        // ==========================================
        // STEP 4: VERIFY AUTHENTICATED
        // ==========================================
        cy.log('**Step 4: Verify Authentication**')

        cy.request({
          method: 'GET',
          url: `${API_URL}/users/profile`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }).then((profileResponse) => {
          expect(profileResponse.status).to.eq(200)
          cy.log(`Profile response: ${JSON.stringify(profileResponse.body)}`)
          expect(profileResponse.body.Email).to.eq(testUser.email)
          cy.log('✅ Successfully authenticated without password')
        })

        cy.log('✅ COMPLETE! Magic link login verified')
      })
    })
  })

  describe('SMS Code Flow', () => {
    it('should send SMS code → verify → login without password', () => {
      // ==========================================
      // SETUP: Create, verify, and add phone
      // ==========================================
      cy.log('**Setup: Register, verify, and add phone**')

      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)

      // Login to add phone number
      cy.loginViaAPI(testUser.email, testUser.password).then((loginResponse: any) => {
        const tokens = loginResponse

        // Get user profile to extract user_id
        cy.request({
          method: 'GET',
          url: `${API_URL}/users/profile`,
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }).then((profileResponse) => {
          const userID = profileResponse.body.ID

          // Add phone number to profile
          cy.request({
            method: 'PUT',
            url: `${API_URL}/users/profile`,
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
            body: {
              phone: testUser.phone,
              first_name: testUser.firstName,
              last_name: testUser.lastName,
            },
          }).then(() => {
            // Send phone verification OTP (no body needed, uses authenticated user)
            cy.request({
              method: 'POST',
              url: `${API_URL}/auth/phone-verification/send`,
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
              },
            }).then(() => {
              // Verify phone with user_id and otp
              cy.request({
                method: 'POST',
                url: `${API_URL}/auth/phone-verification/verify`,
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                },
                body: {
                  user_id: userID,
                  otp: DEV_SMS_CODE,
                },
              }).then(() => {
                // Logout to test passwordless login
                cy.request({
                  method: 'POST',
                  url: `${API_URL}/auth/logout`,
                  headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                  },
                })

                cy.clearCookies()

                // ==========================================
                // STEP 1: REQUEST SMS CODE
                // ==========================================
                cy.log('**Step 1: Request SMS Code for Passwordless Login**')

                cy.request({
                  method: 'POST',
                  url: `${API_URL}/auth/passwordless/sms/send`,
                  body: {
                    phone_number: testUser.phone,
                  },
                }).then((sendResponse) => {
                  expect(sendResponse.status).to.eq(200)
                  cy.log(`✅ SMS code sent to ${testUser.phone}`)
                  cy.log(`📱 DEV_MODE: SMS code is ${DEV_SMS_CODE}`)

                  // ==========================================
                  // STEP 2: VERIFY SMS CODE AND LOGIN
                  // ==========================================
                  cy.log('**Step 2: Verify SMS Code**')

                  cy.request({
                    method: 'POST',
                    url: `${API_URL}/auth/passwordless/sms/verify`,
                    body: {
                      phone_number: testUser.phone,
                      code: DEV_SMS_CODE,
                    },
                  }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body).to.have.property('access_token')
                    expect(response.body).to.have.property('refresh_token')
                    expect(response.body).to.have.property('user_id')
                    cy.log('✅ Logged in via SMS code')

                    const accessToken = response.body.access_token

                    // ==========================================
                    // STEP 3: VERIFY AUTHENTICATED
                    // ==========================================
                    cy.log('**Step 3: Verify Authentication**')

                    cy.request({
                      method: 'GET',
                      url: `${API_URL}/users/profile`,
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                      },
                    }).then((profileResponse) => {
                      expect(profileResponse.status).to.eq(200)
                      expect(profileResponse.body.Email).to.eq(testUser.email)
                      expect(profileResponse.body.Phone).to.eq(testUser.phone)
                      cy.log('✅ Successfully authenticated via SMS without password')
                      cy.log('✅ COMPLETE! SMS passwordless login verified')
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })

  describe.skip('Magic Link via UI', () => {
    // TODO: Implement magic link UI pages
    it('should login via magic link through UI', () => {
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)

      // Visit magic link login page
      cy.visit('/signin/magic-link')

      // Enter email
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('button[type="submit"]').click()

      // Should show check email message
      cy.contains(/check your email|magic link sent/i, { timeout: 10000 }).should('be.visible')

      // Calculate deterministic token
      const magicToken = generateDeterministicMagicToken(testUser.email)

      // Visit magic link URL
      cy.visit(`/magic-link?token=${magicToken}`)

      // Should be logged in
      cy.url().should('match', /\/(dashboard|home)/, { timeout: 10000 })
      cy.getCookie('access_token').should('exist')
    })
  })

  describe('Error Scenarios', () => {
    it('should reject invalid magic link token', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/passwordless/magic-link/verify`,
        body: {
          token: 'invalid-magic-token-12345',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401])
        cy.log('✅ Invalid magic link rejected')
      })
    })

    it('should reject invalid SMS code', () => {
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)
      cy.loginViaAPI(testUser.email, testUser.password).then((loginResponse: any) => {
        const tokens = loginResponse

        // Get user profile to extract user_id
        cy.request({
          method: 'GET',
          url: `${API_URL}/users/profile`,
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }).then((profileResponse) => {
          const userID = profileResponse.body.ID

          // Add phone number to profile
          cy.request({
            method: 'PUT',
            url: `${API_URL}/users/profile`,
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
            body: {
              phone: testUser.phone,
              first_name: testUser.firstName,
              last_name: testUser.lastName,
            },
          }).then(() => {
            // Send phone verification OTP
            cy.request({
              method: 'POST',
              url: `${API_URL}/auth/phone-verification/send`,
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
              },
            }).then(() => {
              // Verify phone with user_id and otp
              cy.request({
                method: 'POST',
                url: `${API_URL}/auth/phone-verification/verify`,
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                },
                body: {
                  user_id: userID,
                  otp: DEV_SMS_CODE,
                },
              }).then(() => {
                // Logout
                cy.request({
                  method: 'POST',
                  url: `${API_URL}/auth/logout`,
                  headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                  },
                })

                cy.clearCookies()

                // Send SMS code for passwordless login
                cy.request({
                  method: 'POST',
                  url: `${API_URL}/auth/passwordless/sms/send`,
                  body: { phone_number: testUser.phone },
                }).then(() => {
                  // Try invalid code
                  cy.request({
                    method: 'POST',
                    url: `${API_URL}/auth/passwordless/sms/verify`,
                    body: {
                      phone_number: testUser.phone,
                      code: '000000', // Wrong code
                    },
                    failOnStatusCode: false,
                  }).then((response) => {
                    expect(response.status).to.be.oneOf([400, 401])
                    cy.log('✅ Invalid SMS code rejected')
                  })
                })
              })
            })
          })
        })
      })
    })

    it('should reject magic link for non-existent user', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/passwordless/magic-link/send`,
        body: {
          email: 'nonexistent@example.com',
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Might return 200 to avoid email enumeration or 404
        expect(response.status).to.be.oneOf([200, 404])
        cy.log('✅ Non-existent user handled')
      })
    })

    it('should prevent magic link token reuse', () => {
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)

      // Send magic link
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/passwordless/magic-link/send`,
        body: { email: testUser.email },
      })

      const magicToken = generateDeterministicMagicToken(testUser.email)

      // Use token once
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/passwordless/magic-link/verify`,
        body: { token: magicToken },
      }).then((response) => {
        expect(response.status).to.eq(200)
      })

      cy.clearCookies()

      // Try to use same token again
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/passwordless/magic-link/verify`,
        body: { token: magicToken },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401])
        cy.log('✅ Magic link token reuse prevented')
      })
    })
  })
})
