import { useUsers, useUpdateUser } from '../../hooks/useUsers'
import { Button } from '@repo/ui/Button'
import { Loader2, Shield, User as UserIcon, Award } from 'lucide-react'

export default function UserManagement() {
  const { data: users, isLoading } = useUsers()
  const updateUser = useUpdateUser()

  const handleRoleChange = async (uid: string, newRole: 'admin' | 'coach' | 'user') => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      await updateUser.mutateAsync({ uid, data: { role: newRole } })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-neutral-100">User Management</h1>

      <div className="rounded-md border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-950 text-neutral-200 uppercase tracking-wider text-xs border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {users?.map(user => (
                <tr key={user.uid} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-200 font-bold">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-200">
                          {user.fullname || 'No Name'}
                        </div>
                        <div className="text-xs text-neutral-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.role === 'admin'
                          ? 'bg-red-950/30 text-red-400 border-red-900/50'
                          : user.role === 'coach'
                            ? 'bg-amber-950/30 text-amber-400 border-amber-900/50'
                            : 'bg-blue-950/30 text-blue-400 border-blue-900/50'
                      }`}
                    >
                      {user.role === 'admin' && <Shield className="h-3 w-3" />}
                      {user.role === 'coach' && <Award className="h-3 w-3" />}
                      {user.role === 'user' && <UserIcon className="h-3 w-3" />}
                      {user.role?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.status === 'active' || user.isActive
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {user.status || (user.isActive ? 'Active' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {user.role !== 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user.uid, 'admin')}
                          className="h-8 text-xs border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:text-neutral-100"
                        >
                          Make Admin
                        </Button>
                      )}
                      {user.role !== 'coach' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user.uid, 'coach')}
                          className="h-8 text-xs border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:text-neutral-100"
                        >
                          Make Coach
                        </Button>
                      )}
                      {user.role !== 'user' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user.uid, 'user')}
                          className="h-8 text-xs border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:text-neutral-100"
                        >
                          Make User
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
