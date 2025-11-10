import { generateTestUser } from '../../support/helpers/auth.helpers'

describe('Authentication: 2FA/TOTP', () => {
  // Testing 2FA/TOTP flows
  let testUser: ReturnType<typeof generateTestUser>
  const API_URL = Cypress.env('API_URL') || 'http://localhost:8080/api/v1'

  beforeEach(() => {
    testUser = generateTestUser()
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('2FA Setup Flow', () => {
    it('should enable 2FA → get QR code → verify with TOTP', () => {
      // ==========================================
      // SETUP: Create, verify, and login user
      // ==========================================
      cy.log('**Setup: Register, verify, and login**')

      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)
      cy.loginViaAPI(testUser.email, testUser.password)

      // ==========================================
      // STEP 1: INITIATE 2FA SETUP
      // ==========================================
      cy.log('**Step 1: Initiate 2FA Setup**')

      let totpSecret: string
      let qrCodeURL: string
      let backupCodes: string[]

      cy.request({
        method: 'POST',
        url: `${API_URL}/mfa/setup`,
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('secret')
        expect(response.body).to.have.property('qr_code_url')
        expect(response.body).to.have.property('backup_codes')

        totpSecret = response.body.secret
        qrCodeURL = response.body.qr_code_url
        backupCodes = response.body.backup_codes

        cy.log(`✅ 2FA setup initiated`)
        cy.log(`Secret: ${totpSecret}`)
        cy.log(`QR Code: ${qrCodeURL}`)
        cy.log(`Backup Codes: ${backupCodes.length} codes generated`)

        // ==========================================
        // STEP 2: GENERATE TOTP CODE
        // ==========================================
        cy.log('**Step 2: Generate TOTP Code**')

        // Use crypto.subtle to generate TOTP code
        cy.task('generateTOTP', totpSecret).then((totpCode: any) => {
          cy.log(`Generated TOTP: ${totpCode}`)

          // ==========================================
          // STEP 3: VERIFY TOTP AND ENABLE 2FA
          // ==========================================
          cy.log('**Step 3: Verify TOTP and Enable 2FA**')

          cy.request({
            method: 'POST',
            url: `${API_URL}/mfa/verify-setup`,
            body: {
              code: totpCode.toString(),
            },
          }).then((response) => {
            expect(response.status).to.eq(200)
            cy.log('✅ 2FA enabled successfully')

            // ==========================================
            // STEP 4: VERIFY 2FA STATUS
            // ==========================================
            cy.log('**Step 4: Verify 2FA Status**')

            cy.request({
              method: 'GET',
              url: `${API_URL}/mfa/status`,
            }).then((statusResponse) => {
              expect(statusResponse.status).to.eq(200)
              expect(statusResponse.body.mfa_enabled).to.be.true
              cy.log('✅ 2FA status confirmed')
            })
          })
        })
      })
    })
  })

  describe('2FA Login Flow', () => {
    it('should require TOTP code during login when 2FA is enabled', () => {
      // Setup: Enable 2FA
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)
      cy.loginViaAPI(testUser.email, testUser.password)

      cy.request({
        method: 'POST',
        url: `${API_URL}/mfa/setup`,
      }).then((response) => {
        const totpSecret = response.body.secret

        cy.task('generateTOTP', totpSecret).then((totpCode: any) => {
          cy.request({
            method: 'POST',
            url: `${API_URL}/mfa/verify-setup`,
            body: { code: totpCode.toString() },
          }).then(() => {
            // ==========================================
            // LOGOUT AND CLEAR SESSION
            // ==========================================
            cy.request({
              method: 'POST',
              url: `${API_URL}/auth/logout`,
            }).then(() => {
              cy.clearCookies()
              cy.clearLocalStorage()

              // ==========================================
              // STEP 1: LOGIN WITHOUT MFA CODE (SHOULD FAIL)
              // ==========================================
              cy.log('**Step 1: Login Without MFA Code**')

              cy.request({
                method: 'POST',
                url: `${API_URL}/auth/login`,
                body: {
                  email: testUser.email,
                  password: testUser.password,
                },
                failOnStatusCode: false,
              }).then((response) => {
                expect(response.status).to.eq(401)
                expect(response.body.code).to.eq('MFA_REQUIRED')
                cy.log('✅ MFA required error received')

                // ==========================================
                // STEP 2: LOGIN WITH MFA CODE
                // ==========================================
                cy.log('**Step 2: Login with MFA Code**')

                cy.task('generateTOTP', totpSecret).then((totpCode: any) => {
                  cy.request({
                    method: 'POST',
                    url: `${API_URL}/auth/login`,
                    body: {
                      email: testUser.email,
                      password: testUser.password,
                      mfa_code: totpCode.toString(),
                    },
                  }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body).to.have.property('access_token')
                    expect(response.body).to.have.property('refresh_token')
                    cy.log('✅ 2FA login successful')

                    // ==========================================
                    // STEP 3: VERIFY AUTHENTICATED
                    // ==========================================
                    cy.log('**Step 3: Verify Authenticated**')

                    cy.request({
                      method: 'GET',
                      url: `${API_URL}/users/profile`,
                    }).then((profileResponse) => {
                      expect(profileResponse.status).to.eq(200)
                      expect(profileResponse.body.Email).to.eq(testUser.email)
                      cy.log('✅ Successfully authenticated with 2FA')
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

  describe('Backup Codes', () => {
    it('should login with backup code when TOTP unavailable', () => {
      // Setup: Enable 2FA
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)
      cy.loginViaAPI(testUser.email, testUser.password)

      cy.request({
        method: 'POST',
        url: `${API_URL}/mfa/setup`,
      }).then((response) => {
        const totpSecret = response.body.secret
        const backupCodes = response.body.backup_codes
        cy.log(`Backup codes: ${backupCodes}`)

        cy.task('generateTOTP', totpSecret).then((totpCode: any) => {
          cy.request({
            method: 'POST',
            url: `${API_URL}/mfa/verify-setup`,
            body: { code: totpCode.toString() },
          }).then(() => {
            // ==========================================
            // LOGOUT AND CLEAR SESSION
            // ==========================================
            cy.request({
              method: 'POST',
              url: `${API_URL}/auth/logout`,
            }).then(() => {
              cy.clearCookies()
              cy.clearLocalStorage()

              // ==========================================
              // STEP 1: LOGIN WITHOUT MFA (SHOULD FAIL)
              // ==========================================
              cy.log('**Step 1: Login Without MFA Code**')

              cy.request({
                method: 'POST',
                url: `${API_URL}/auth/login`,
                body: {
                  email: testUser.email,
                  password: testUser.password,
                },
                failOnStatusCode: false,
              }).then((response) => {
                expect(response.status).to.eq(401)
                expect(response.body.code).to.eq('MFA_REQUIRED')
                cy.log('✅ MFA required error received')

                // ==========================================
                // STEP 2: LOGIN WITH BACKUP CODE
                // ==========================================
                cy.log('**Step 2: Login with Backup Code**')

                cy.request({
                  method: 'POST',
                  url: `${API_URL}/auth/login`,
                  body: {
                    email: testUser.email,
                    password: testUser.password,
                    mfa_code: backupCodes[0],
                  },
                }).then((response) => {
                  expect(response.status).to.eq(200)
                  expect(response.body).to.have.property('access_token')
                  expect(response.body).to.have.property('refresh_token')
                  cy.log('✅ Login with backup code successful')

                  // ==========================================
                  // STEP 3: VERIFY BACKUP CODE CONSUMED
                  // ==========================================
                  cy.log('**Step 3: Verify Backup Code Consumed**')

                  cy.request({
                    method: 'GET',
                    url: `${API_URL}/mfa/status`,
                  }).then((statusResponse) => {
                    expect(statusResponse.body.backup_codes_remaining).to.eq(backupCodes.length - 1)
                    cy.log('✅ Backup code consumed')
                  })
                })
              })
            })
          })
        })
      })
    })
  })

  describe('Disable 2FA', () => {
    it('should disable 2FA with password confirmation', () => {
      // Setup: Enable 2FA
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)
      cy.loginViaAPI(testUser.email, testUser.password)

      cy.request({
        method: 'POST',
        url: `${API_URL}/mfa/setup`,
      }).then((response) => {
        const totpSecret = response.body.secret

        cy.task('generateTOTP', totpSecret).then((totpCode: any) => {
          cy.request({
            method: 'POST',
            url: `${API_URL}/mfa/verify-setup`,
            body: { code: totpCode.toString() },
          }).then(() => {
            // Disable 2FA (requires password + current TOTP code)
            cy.task('generateTOTP', totpSecret).then((disableTotpCode: any) => {
              cy.request({
                method: 'POST',
                url: `${API_URL}/mfa/disable`,
                body: {
                  password: testUser.password,
                  code: disableTotpCode.toString(),
                },
              }).then((response) => {
                expect(response.status).to.eq(200)
                cy.log('✅ 2FA disabled')

              // Verify status
              cy.request({
                method: 'GET',
                url: `${API_URL}/mfa/status`,
              }).then((response) => {
                expect(response.body.mfa_enabled).to.be.false
                cy.log('✅ 2FA confirmed disabled')

                // Verify login doesn't require 2FA
                cy.request({
                  method: 'POST',
                  url: `${API_URL}/auth/logout`,
                }).then(() => {
                  cy.clearCookies()
                  cy.clearLocalStorage()

                  cy.request({
                    method: 'POST',
                    url: `${API_URL}/auth/login`,
                    body: {
                      email: testUser.email,
                      password: testUser.password,
                    },
                  }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body).to.have.property('access_token')
                    expect(response.body.requires_2fa).to.be.undefined
                    cy.log('✅ Login without 2FA confirmed')
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

  describe('Error Scenarios', () => {
    it('should reject invalid TOTP code', () => {
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)
      cy.loginViaAPI(testUser.email, testUser.password)

      cy.request({
        method: 'POST',
        url: `${API_URL}/mfa/setup`,
      })

      cy.request({
        method: 'POST',
        url: `${API_URL}/mfa/verify-setup`,
        body: {
          code: '000000', // Invalid code
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401])
        cy.log('✅ Invalid TOTP rejected')
      })
    })

    it('should reject expired backup code', () => {
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)
      cy.loginViaAPI(testUser.email, testUser.password)

      cy.request({
        method: 'POST',
        url: `${API_URL}/mfa/setup`,
      }).then((response) => {
        const totpSecret = response.body.secret
        const backupCodes = response.body.backup_codes

        cy.task('generateTOTP', totpSecret).then((totpCode: any) => {
          cy.request({
            method: 'POST',
            url: `${API_URL}/mfa/verify-setup`,
            body: { code: totpCode.toString() },
          }).then(() => {
            // ==========================================
            // STEP 1: LOGOUT AND USE BACKUP CODE
            // ==========================================
            cy.log('**Step 1: Logout and Use Backup Code**')

            cy.request({
              method: 'POST',
              url: `${API_URL}/auth/logout`,
            }).then(() => {
              cy.clearCookies()
              cy.clearLocalStorage()

              cy.request({
                method: 'POST',
                url: `${API_URL}/auth/login`,
                body: {
                  email: testUser.email,
                  password: testUser.password,
                  mfa_code: backupCodes[0],
                },
              }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property('access_token')
                cy.log('✅ First backup code login successful')

                // ==========================================
                // STEP 2: LOGOUT AND TRY TO REUSE SAME CODE
                // ==========================================
                cy.log('**Step 2: Logout and Try to Reuse Same Code**')

                cy.request({
                  method: 'POST',
                  url: `${API_URL}/auth/logout`,
                }).then(() => {
                  cy.clearCookies()
                  cy.clearLocalStorage()

                  cy.request({
                    method: 'POST',
                    url: `${API_URL}/auth/login`,
                    body: {
                      email: testUser.email,
                      password: testUser.password,
                      mfa_code: backupCodes[0],
                    },
                    failOnStatusCode: false,
                  }).then((response) => {
                    expect(response.status).to.eq(401)
                    cy.log('✅ Used backup code rejected')
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
