import { useAuth } from '../../providers/AuthContext'

export default function UserDashboard() {
  const { signOut } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
      <p className="mb-4">Welcome! Track your workouts and progress here.</p>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Sign Out
      </button>
    </div>
  )
}
