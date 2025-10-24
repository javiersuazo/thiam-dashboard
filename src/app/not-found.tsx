/**
 * Root Not Found Page
 *
 * Shown when:
 * - Invalid locale is requested
 * - Page doesn't exist at root level
 */

import Link from 'next/link'

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            404
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '2rem' }}>
            Page not found
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  )
}
