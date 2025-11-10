import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      API_URL: 'http://localhost:8080/api/v1',
      MOCK_API: false, // Set to true to mock API responses, false to hit real backend
    },
    setupNodeEvents(on, config) {
      on('task', {
        generateTOTP(secret: string) {
          // Generate TOTP code using the secret
          // This is a simple implementation - in production use a library like 'otplib'
          const crypto = require('crypto')
          const base32 = require('hi-base32')

          // Decode base32 secret
          const buffer = base32.decode.asBytes(secret.replace(/=+$/, ''))

          // Get current time window (30 second windows)
          const epoch = Math.floor(Date.now() / 1000)
          const timeWindow = Math.floor(epoch / 30)

          // Create HMAC
          const timeBuffer = Buffer.alloc(8)
          timeBuffer.writeBigInt64BE(BigInt(timeWindow))

          const hmac = crypto.createHmac('sha1', Buffer.from(buffer))
          hmac.update(timeBuffer)
          const hash = hmac.digest()

          // Dynamic truncation
          const offset = hash[hash.length - 1] & 0xf
          const code = (
            ((hash[offset] & 0x7f) << 24) |
            ((hash[offset + 1] & 0xff) << 16) |
            ((hash[offset + 2] & 0xff) << 8) |
            (hash[offset + 3] & 0xff)
          ) % 1000000

          return code.toString().padStart(6, '0')
        },
      })

      return config
    },
  },
})
