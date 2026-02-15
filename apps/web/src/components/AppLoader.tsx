/**
 * Global loading spinner for auth, route guards, and consistent UX.
 * Mobile-first: large touch target, reduced motion respected.
 */
export default function AppLoader() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-black text-neutral-100"
      role="status"
      aria-label="Loading"
    >
      <div
        className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-800 border-t-neutral-400"
        style={{ animationDuration: '0.8s' }}
      />
      <p className="mt-4 text-sm text-neutral-500 uppercase tracking-wider">Loading</p>
    </div>
  )
}
