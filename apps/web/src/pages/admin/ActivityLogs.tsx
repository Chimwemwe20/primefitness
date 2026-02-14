import { useActivityLogs } from '../../hooks/useActivityLogs'
import { Loader2, Clock } from 'lucide-react'

export default function ActivityLogsView() {
  const { data: logs, isLoading } = useActivityLogs()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-neutral-100">Activity Logs</h1>

      <div className="rounded-md border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-950 text-neutral-200 uppercase tracking-wider text-xs border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {logs?.map(log => (
                <tr key={log.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Clock className="h-3 w-3" />
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        log.action === 'create'
                          ? 'bg-green-950/30 text-green-400 border-green-900/50'
                          : log.action === 'update'
                            ? 'bg-blue-950/30 text-blue-400 border-blue-900/50'
                            : log.action === 'delete'
                              ? 'bg-red-950/30 text-red-400 border-red-900/50'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {log.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-300 font-mono text-xs">{log.userId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <pre className="text-xs text-neutral-500 whitespace-pre-wrap max-w-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
