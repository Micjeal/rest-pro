/**
 * Auth Layout
 * Wrapper for all authentication pages
 * No navigation or sidebar - full screen authentication experience
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
