import { useState } from 'react'
import { useActivityLogs } from '../../hooks/useActivityLogs'
import { useUsers } from '../../hooks/useUsers'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Input } from '@repo/ui/Input'
import {
  Loader2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  FileText,
  Plus,
  Edit,
  Trash2,
  LogIn,
  Activity as ActivityIcon,
} from 'lucide-react'

export default function ActivityLogsView() {
  const { data: logs, isLoading } = useActivityLogs()
  const { data: users } = useUsers()

  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Create user map for quick lookup
  const userMap = users?.reduce(
    (acc, user) => {
      acc[user.uid] = user.email || user.fullname || 'Unknown User'
      return acc
    },
    {} as Record<string, string>
  )

  // Helper to format JSON for better readability
  const formatDetails = (details: Record<string, unknown> | null | undefined): string => {
    if (!details) return 'No details'

    try {
      // Convert common patterns to readable format
      const formatted: string[] = []

      Object.entries(details).forEach(([key, value]) => {
        const readableKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim()

        if (typeof value === 'object' && value !== null) {
          formatted.push(`${readableKey}: ${JSON.stringify(value, null, 2)}`)
        } else {
          formatted.push(`${readableKey}: ${value}`)
        }
      })

      return formatted.join('\n')
    } catch {
      return JSON.stringify(details, null, 2)
    }
  }

  // Get icon for action type
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return Plus
      case 'update':
        return Edit
      case 'delete':
        return Trash2
      case 'login':
        return LogIn
      default:
        return ActivityIcon
    }
  }

  // Get badge color for action
  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-950/30 text-green-400 border-green-900/50'
      case 'update':
        return 'bg-blue-950/30 text-blue-400 border-blue-900/50'
      case 'delete':
        return 'bg-red-950/30 text-red-400 border-red-900/50'
      case 'login':
        return 'bg-purple-950/30 text-purple-400 border-purple-900/50'
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700'
    }
  }

  // Filter logs
  const filteredLogs = logs?.filter(log => {
    const userEmail = userMap?.[log.userId] || log.userId
    const matchesSearch =
      userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceType?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    return matchesSearch && matchesAction
  })

  // Pagination
  const totalPages = Math.ceil((filteredLogs?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLogs = filteredLogs?.slice(startIndex, startIndex + itemsPerPage)

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
            Activity Logs
          </h1>
          <p className="text-sm sm:text-base text-neutral-400">
            Monitor all system activities and user actions
          </p>
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
                placeholder="Search by user, action, or resource..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-neutral-800 border-neutral-700 h-11 text-base"
              />
            </div>

            {/* Action Filter */}
            <div className="relative sm:w-48">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                size={18}
              />
              <select
                value={actionFilter}
                onChange={e => {
                  setActionFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-11 pl-10 pr-4 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 text-base appearance-none cursor-pointer"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="login">Login</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-xs sm:text-sm text-neutral-500">
            Showing {paginatedLogs?.length || 0} of {filteredLogs?.length || 0} logs
          </div>
        </Card>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-400">
                <thead className="bg-neutral-950 text-neutral-200 uppercase tracking-wider text-xs border-b border-neutral-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Resource</th>
                    <th className="px-6 py-4 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {paginatedLogs?.map(log => {
                    const ActionIcon = getActionIcon(log.action)
                    const userEmail = userMap?.[log.userId] || log.userId

                    return (
                      <tr key={log.id} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-neutral-500 text-xs">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {log.timestamp
                              ? new Date(log.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getActionBadgeClass(log.action)}`}
                          >
                            <ActionIcon className="h-3 w-3" />
                            {log.action.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {userEmail[0]?.toUpperCase()}
                            </div>
                            <span className="text-neutral-300 text-sm truncate max-w-xs">
                              {userEmail}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-neutral-400 text-xs font-mono capitalize">
                            {log.resourceType?.replace('-', ' ') || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <pre className="text-xs text-neutral-500 whitespace-pre-wrap font-mono bg-neutral-950 p-2 rounded">
                              {formatDetails(log.details)}
                            </pre>
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
          {paginatedLogs?.map(log => {
            const ActionIcon = getActionIcon(log.action)
            const userEmail = userMap?.[log.userId] || log.userId

            return (
              <Card key={log.id} className="bg-neutral-900 border-neutral-800 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {userEmail[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-200 truncate">{userEmail}</p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getActionBadgeClass(log.action)} flex-shrink-0 ml-2`}
                  >
                    <ActionIcon className="h-3 w-3" />
                    {log.action}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="h-3 w-3 text-neutral-500" />
                    <span className="text-neutral-500">Resource:</span>
                    <span className="text-neutral-300 font-mono capitalize">
                      {log.resourceType?.replace('-', ' ') || 'N/A'}
                    </span>
                  </div>

                  {log.details && (
                    <div className="mt-2 pt-2 border-t border-neutral-800">
                      <p className="text-xs text-neutral-500 mb-1">Details:</p>
                      <pre className="text-xs text-neutral-400 whitespace-pre-wrap font-mono bg-neutral-950 p-2 rounded">
                        {formatDetails(log.details)}
                      </pre>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}

          {paginatedLogs?.length === 0 && (
            <Card className="bg-neutral-900 border-neutral-800 p-8 text-center">
              <ActivityIcon className="h-12 w-12 text-neutral-700 mx-auto mb-3" />
              <p className="text-neutral-500">No activity logs found</p>
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
      </div>
    </div>
  )
}
