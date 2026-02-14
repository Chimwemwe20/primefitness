import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { ActivityLog } from '@repo/shared/schemas'

export const logActivity = async (
  userId: string,
  action: ActivityLog['action'],
  resourceType: ActivityLog['resourceType'],
  resourceId?: string,
  details?: Record<string, unknown>
) => {
  try {
    await addDoc(collection(db, 'activity-logs'), {
      userId,
      action,
      resourceType,
      resourceId,
      details,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // We don't want to block the user action if logging fails, so we just log the error
  }
}
