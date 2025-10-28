import AdminLayoutClient from './AdminLayoutClient'

/**
 * Admin Layout - Server Component
 *
 * Authentication is enforced by middleware - no need to check again here.
 * Middleware ensures that only authenticated users can reach this layout.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render client-side layout with children
  // Authentication is already handled by middleware
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
