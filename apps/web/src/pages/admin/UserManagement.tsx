import { useState } from 'react'
import { useUsers, useUpdateUser, useSoftDeleteUser } from '../../hooks/useUsers'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Input } from '@repo/ui/Input'
import { Dialog } from '@repo/ui/Dialog'
import { useToast } from '@repo/ui/useToast'
import {
  Loader2,
  Shield,
  User as UserIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
} from 'lucide-react'

export default function UserManagement() {
  const { data: users, isLoading } = useUsers()
  const updateUser = useUpdateUser()
  const softDeleteUser = useSoftDeleteUser()
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false)
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    uid: string
    newRole: 'admin' | 'user'
  } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const handleRoleChangeClick = (uid: string, newRole: 'admin' | 'user') => {
    setPendingRoleChange({ uid, newRole })
    setRoleChangeDialogOpen(true)
  }

  const handleRoleChangeConfirm = async () => {
    if (!pendingRoleChange) return
    try {
      await updateUser.mutateAsync({
        uid: pendingRoleChange.uid,
        data: { role: pendingRoleChange.newRole },
      })
      toast.success(`User role changed to ${pendingRoleChange.newRole} successfully!`)
    } catch (error) {
      console.error('Failed to update user role:', error)
      toast.error('Failed to update user role. Please try again.')
    } finally {
      setPendingRoleChange(null)
    }
  }

  const handleDeleteClick = (uid: string) => {
    setUserToDelete(uid)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    try {
      await softDeleteUser.mutateAsync(userToDelete)
      toast.success('User deactivated successfully!')
    } catch (error) {
      console.error('Failed to deactivate user:', error)
      toast.error('Failed to deactivate user. Please try again.')
    } finally {
      setUserToDelete(null)
    }
  }

  // Filter and search
  const filteredUsers = users?.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Pagination
  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers?.slice(startIndex, startIndex + itemsPerPage)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield
      default:
        return UserIcon
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-950/30 text-red-400 border-red-900/50'
      default:
        return 'bg-blue-950/30 text-blue-400 border-blue-900/50'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-neutral-100">
            User Management
          </h1>
          <p className="text-sm sm:text-base text-neutral-400">Manage user roles and permissions</p>
        </div>

        {/* Filters */}
        <Card className="bg-neutral-900 border-neutral-800 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                size={18}
              />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-neutral-800 border-neutral-700 h-11 text-base"
              />
            </div>

            {/* Role Filter */}
            <div className="relative sm:w-40">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                size={18}
              />
              <select
                value={roleFilter}
                onChange={e => {
                  setRoleFilter(e.target.value as typeof roleFilter)
                  setCurrentPage(1)
                }}
                className="w-full h-11 pl-10 pr-4 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 text-base appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-xs sm:text-sm text-neutral-500">
            Showing {paginatedUsers?.length || 0} of {filteredUsers?.length || 0} users
          </div>
        </Card>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
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
                  {paginatedUsers?.map(user => {
                    const RoleIcon = getRoleIcon(user.role)
                    return (
                      <tr key={user.uid} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
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
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {user.role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active' || user.isActive
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                            }`}
                          >
                            {user.status || (user.isActive ? 'Active' : 'Inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {user.role !== 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChangeClick(user.uid, 'admin')}
                                className="h-8 text-xs border-neutral-700 hover:border-red-500/50 hover:text-red-400"
                              >
                                <Shield size={14} className="mr-1" />
                                Admin
                              </Button>
                            )}
                            {user.role !== 'user' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChangeClick(user.uid, 'user')}
                                className="h-8 text-xs border-neutral-700 hover:border-blue-500/50 hover:text-blue-400"
                              >
                                <UserIcon size={14} className="mr-1" />
                                User
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(user.uid)}
                              className="h-8 text-xs border-neutral-700 hover:border-red-500/50 hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {paginatedUsers?.map(user => {
            const RoleIcon = getRoleIcon(user.role)
            return (
              <Card key={user.uid} className="bg-neutral-900 border-neutral-800 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-100 truncate">
                      {user.fullname || 'No Name'}
                    </h3>
                    <p className="text-sm text-neutral-500 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {user.role}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' || user.isActive
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {user.status || (user.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-800">
                  {user.role !== 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleChangeClick(user.uid, 'admin')}
                      className="flex-1 h-9 text-xs border-neutral-700 hover:border-red-500/50 hover:text-red-400"
                    >
                      <Shield size={14} className="mr-1" />
                      Admin
                    </Button>
                  )}
                  {user.role !== 'user' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleChangeClick(user.uid, 'user')}
                      className="flex-1 h-9 text-xs border-neutral-700 hover:border-blue-500/50 hover:text-blue-400"
                    >
                      <UserIcon size={14} className="mr-1" />
                      User
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(user.uid)}
                    className="h-9 text-xs border-neutral-700 hover:border-red-500/50 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            )
          })}

          {paginatedUsers?.length === 0 && (
            <Card className="bg-neutral-900 border-neutral-800 p-8 text-center">
              <p className="text-neutral-500">No users found</p>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-neutral-700"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-neutral-700"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Role Change Confirmation Dialog */}
        <Dialog
          open={roleChangeDialogOpen}
          onOpenChange={setRoleChangeDialogOpen}
          title="Change User Role"
          description={`Are you sure you want to change this user's role to ${pendingRoleChange?.newRole}? This will affect their permissions and access.`}
          confirmText="Change Role"
          cancelText="Cancel"
          onConfirm={handleRoleChangeConfirm}
          variant="default"
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Deactivate User"
          description="Are you sure you want to deactivate this user? Their account will be marked as deleted but can be restored later."
          confirmText="Deactivate"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </div>
  )
}
