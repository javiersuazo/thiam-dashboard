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
      // implement node event listeners here
    },
  },
})
