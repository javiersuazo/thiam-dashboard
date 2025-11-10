/**
 * WebAuthn/Passkey Testing Helpers
 *
 * These helpers enable testing of passkey/WebAuthn flows in Cypress.
 *
 * IMPORTANT: WebAuthn testing requires either:
 * 1. Chrome DevTools Protocol (CDP) with virtual authenticator
 * 2. Backend DEV_MODE that accepts mock credentials
 * 3. Real browser with actual security keys/biometrics
 */

/**
 * Creates a mock WebAuthn credential creation response
 *
 * This is a simplified mock - real WebAuthn credentials are cryptographically signed
 */
export function createMockCredential(challenge: string, origin: string) {
  const credentialId = 'mock-credential-' + Date.now()

  return {
    id: credentialId,
    rawId: btoa(credentialId),
    response: {
      attestationObject: btoa(JSON.stringify({
        fmt: 'none',
        attStmt: {},
        authData: 'mock-auth-data',
      })),
      clientDataJSON: btoa(JSON.stringify({
        type: 'webauthn.create',
        challenge: challenge,
        origin: origin,
        crossOrigin: false,
      })),
    },
    type: 'public-key',
  }
}

/**
 * Creates a mock WebAuthn assertion (authentication) response
 */
export function createMockAssertion(challenge: string, origin: string, credentialId: string) {
  return {
    id: credentialId,
    rawId: btoa(credentialId),
    response: {
      authenticatorData: btoa('mock-authenticator-data'),
      clientDataJSON: btoa(JSON.stringify({
        type: 'webauthn.get',
        challenge: challenge,
        origin: origin,
        crossOrigin: false,
      })),
      signature: btoa('mock-signature'),
      userHandle: btoa('mock-user-handle'),
    },
    type: 'public-key',
  }
}

/**
 * Enables Chrome's Virtual Authenticator (requires Chrome DevTools Protocol)
 *
 * Usage in test:
 * ```
 * before(() => {
 *   cy.task('enableVirtualAuthenticator')
 * })
 * ```
 */
export function setupVirtualAuthenticator() {
  // This would require CDP integration
  // See: https://chromedevtools.github.io/devtools-protocol/tot/WebAuthn/
  return {
    protocol: 'ctap2',
    transport: 'internal',
    hasResidentKey: true,
    hasUserVerification: true,
    isUserVerified: true,
  }
}

/**
 * Stub WebAuthn API for testing
 *
 * Call this in a beforeEach hook to mock navigator.credentials
 */
export function stubWebAuthnAPI(win: Window) {
  // Store original if exists
  const originalCredentials = win.navigator.credentials

  // Mock create
  win.navigator.credentials.create = cy.stub().resolves({
    id: 'test-credential-id',
    rawId: new ArrayBuffer(16),
    response: {
      attestationObject: new ArrayBuffer(64),
      clientDataJSON: new ArrayBuffer(128),
    },
    type: 'public-key',
  } as any)

  // Mock get
  win.navigator.credentials.get = cy.stub().resolves({
    id: 'test-credential-id',
    rawId: new ArrayBuffer(16),
    response: {
      authenticatorData: new ArrayBuffer(37),
      clientDataJSON: new ArrayBuffer(128),
      signature: new ArrayBuffer(64),
      userHandle: new ArrayBuffer(16),
    },
    type: 'public-key',
  } as any)

  return originalCredentials
}

/**
 * Converts base64url to ArrayBuffer (used in WebAuthn)
 */
export function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Converts ArrayBuffer to base64url (used in WebAuthn)
 */
export function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = btoa(binary)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Check if browser supports WebAuthn
 */
export function isWebAuthnSupported(): boolean {
  return !!(window.navigator && window.navigator.credentials && window.navigator.credentials.create)
}
