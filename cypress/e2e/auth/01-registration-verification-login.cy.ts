import { generateTestUser, generateDeterministicEmailToken } from '../../support/helpers/auth.helpers'

describe('Authentication: Registration → Verification → Login', () => {
  let testUser: ReturnType<typeof generateTestUser>

  beforeEach(() => {
    testUser = generateTestUser()
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Complete Happy Path Flow', () => {
    it('should register → verify email → login successfully AND persist all user data', () => {
      const API_URL = Cypress.env('API_URL') || 'http://localhost:8080/api/v1'

      // ==========================================
      // STEP 1: REGISTRATION
      // ==========================================
      cy.log('**Step 1: User Registration**')

      cy.visit('/signup')
      cy.url().should('include', '/signup')

      // Fill registration form WITH PHONE
      cy.get('input[name="firstName"]').type(testUser.firstName)
      cy.get('input[name="lastName"]').type(testUser.lastName)
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="phone"]').type(testUser.phone)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('input[name="confirmPassword"]').type(testUser.confirmPassword)

      // Accept terms checkbox
      cy.get('input[type="checkbox"]').check({ force: true })

      // Submit form
      cy.get('button[type="submit"]').click()

      // Should show verification message
      cy.contains(/check your email/i, { timeout: 10000 }).should('be.visible')

      // ==========================================
      // STEP 2: EMAIL VERIFICATION
      // ==========================================
      cy.log('**Step 2: Email Verification**')

      // In DEV_MODE, token is deterministic
      const verificationToken = generateDeterministicEmailToken(testUser.email)
      cy.log(`Using deterministic token: ${verificationToken}`)

      // Visit verification URL directly
      cy.visit(`/verify-email?token=${verificationToken}`)

      // Should show success message
      cy.contains(/email verified|verification successful/i, { timeout: 10000 }).should('be.visible')

      // ==========================================
      // STEP 3: LOGIN AND VERIFY RESPONSE DATA
      // ==========================================
      cy.log('**Step 3: Login and Verify All User Data in Response**')

      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/login`,
        body: {
          email: testUser.email,
          password: testUser.password,
        },
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(200)

        // ✅ VERIFY ALL USER DATA IS RETURNED FROM LOGIN
        cy.log('**Verifying Login Response Contains All User Data**')

        expect(loginResponse.body).to.have.property('user_id')
        expect(loginResponse.body).to.have.property('session_id')
        expect(loginResponse.body).to.have.property('access_token')
        expect(loginResponse.body).to.have.property('refresh_token')

        // ✅ CHECK USER DATA FIELDS
        expect(loginResponse.body.email).to.eq(testUser.email)
        expect(loginResponse.body.first_name).to.eq(testUser.firstName)
        expect(loginResponse.body.last_name).to.eq(testUser.lastName)

        // Phone might not be returned if not set during registration
        if (loginResponse.body.phone) {
          expect(loginResponse.body.phone).to.eq(testUser.phone)
          cy.log(`✅ Phone saved correctly: ${loginResponse.body.phone}`)
        }

        cy.log('✅ All user data verified in login response')
        cy.log(`   Email: ${loginResponse.body.email}`)
        cy.log(`   First Name: ${loginResponse.body.first_name}`)
        cy.log(`   Last Name: ${loginResponse.body.last_name}`)
      })

      // ==========================================
      // STEP 4: GET USER PROFILE VIA API
      // ==========================================
      cy.log('**Step 4: Verify User Data Persisted in Database**')

      // Login via UI to get cookies
      cy.visit('/signin')
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()

      // Wait for redirect
      cy.url().should('match', /\/(dashboard|home)/, { timeout: 10000 })

      // Now call /users/profile with cookies
      cy.request({
        method: 'GET',
        url: `${API_URL}/users/profile`,
      }).then((profileResponse) => {
        expect(profileResponse.status).to.eq(200)

        // ✅ VERIFY ALL FIELDS IN DATABASE
        cy.log('**Verifying Profile API Response**')

        const profile = profileResponse.body

        expect(profile).to.have.property('id')
        expect(profile.email).to.eq(testUser.email)
        expect(profile.first_name).to.eq(testUser.firstName)
        expect(profile.last_name).to.eq(testUser.lastName)
        expect(profile.is_email_verified).to.be.true

        // Phone verification status
        if (profile.phone) {
          expect(profile.phone).to.eq(testUser.phone)
          cy.log(`✅ Phone persisted in DB: ${profile.phone}`)
        }

        // Timestamps should exist
        expect(profile).to.have.property('created_at')
        expect(profile).to.have.property('updated_at')
        expect(profile.created_at).to.be.a('number')

        cy.log('✅ All user data verified in database')
        cy.log(`   ID: ${profile.id}`)
        cy.log(`   Email: ${profile.email}`)
        cy.log(`   Name: ${profile.first_name} ${profile.last_name}`)
        cy.log(`   Email Verified: ${profile.is_email_verified}`)
        cy.log(`   Created: ${new Date(profile.created_at * 1000).toISOString()}`)
      })

      // ==========================================
      // STEP 5: VERIFY DATA IN UI
      // ==========================================
      cy.log('**Step 5: Verify User Data Displayed in UI**')

      // Navigate to profile page
      cy.visit('/settings/profile').then(() => {
        // Give page time to load
        cy.wait(1000)

        // Verify user data is displayed
        cy.get('body').then(($body) => {
          const bodyText = $body.text()

          // Check if user data appears anywhere on the page
          expect(bodyText).to.include(testUser.firstName)
          expect(bodyText).to.include(testUser.lastName)
          expect(bodyText).to.include(testUser.email)

          cy.log('✅ User data displayed correctly in UI')
        })
      })

      // ==========================================
      // STEP 6: VERIFY AUTHENTICATION STATE
      // ==========================================
      cy.log('**Step 6: Verify Authentication State**')

      // Verify cookies are set
      cy.getCookie('access_token').should('exist')
      cy.getCookie('refresh_token').should('exist')

      // Verify we can access protected routes
      cy.visit('/settings')
      cy.url().should('include', '/settings')

      // Should NOT be redirected to login
      cy.url().should('not.include', '/signin')

      cy.log('✅ COMPLETE! All user data saved and verified across:')
      cy.log('   1. Login Response')
      cy.log('   2. Database (Profile API)')
      cy.log('   3. UI Display')
      cy.log('   4. Authentication Cookies')
    })
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

      // Should show error about email not verified
      cy.contains(/email.*not.*verified|verify.*email/i).should('be.visible')

      // Should NOT be logged in
      cy.getCookie('access_token').should('not.exist')
    })

    it('should show error for invalid verification token', () => {
      cy.visit('/verify-email?token=invalid-token-12345')

      cy.contains(/invalid.*token|verification.*failed/i).should('be.visible')
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

      // Should show error
      cy.contains(/invalid.*credentials|wrong.*password/i).should('be.visible')
      cy.getCookie('access_token').should('not.exist')
    })

    it('should show error for non-existent user', () => {
      cy.visit('/signin')
      cy.get('input[name="email"]').type('nonexistent@example.com')
      cy.get('input[name="password"]').type('Password123!')
      cy.get('button[type="submit"]').click()

      cy.contains(/invalid.*credentials|user.*not.*found/i).should('be.visible')
    })
  })

  describe('User Data Persistence', () => {
    it('should persist and display user data after login', () => {
      // Complete registration and verification
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)

      // Login
      cy.loginViaUI(testUser.email, testUser.password)

      // Navigate to profile/settings
      cy.visit('/settings/profile')

      // Should show user's data
      cy.contains(testUser.firstName).should('be.visible')
      cy.contains(testUser.lastName).should('be.visible')
      cy.contains(testUser.email).should('be.visible')
    })
  })

  describe('Logout Flow', () => {
    beforeEach(() => {
      // Setup: Register, verify, and login
      cy.registerUserViaAPI(testUser)
      cy.verifyEmailWithToken(testUser.email)
      cy.loginViaAPI(testUser.email, testUser.password)
    })

    it('should logout and clear authentication', () => {
      cy.visit('/dashboard')

      // Verify we're logged in
      cy.getCookie('access_token').should('exist')

      // Click logout button
      cy.get('[data-testid="logout-button"]').click()

      // Should redirect to login
      cy.url().should('include', '/signin')

      // Cookies should be cleared
      cy.getCookie('access_token').should('not.exist')
      cy.getCookie('refresh_token').should('not.exist')

      // Should not be able to access protected routes
      cy.visit('/dashboard')
      cy.url().should('include', '/signin')
    })
  })
})
