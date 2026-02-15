import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { ProgressEntry } from '@repo/shared/schemas'
import { logActivity } from '../lib/activity'

export function useProgressEntries() {
  return useQuery({
    queryKey: ['progress-entries', auth.currentUser?.uid],
    queryFn: async () => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const q = query(
        collection(db, 'progress-entries'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs
        .filter(d => !d.data().deletedAt) // filter out soft-deleted
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate(),
          } as ProgressEntry & { id: string }
        })
    },
    enabled: !!auth.currentUser?.uid,
  })
}

export function useCreateProgressEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entryData: Omit<ProgressEntry, 'id' | 'userId' | 'createdAt'>) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const docRef = await addDoc(collection(db, 'progress-entries'), {
        ...entryData,
        userId,
        deletedAt: null,
        createdAt: serverTimestamp(),
      })

      await logActivity(userId, 'create', 'profile', docRef.id, {
        type: 'progress_entry',
        weight: entryData.weight,
        bodyFat: entryData.bodyFat,
      })

      return { id: docRef.id, ...entryData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-entries'] })
    },
  })
}

/** Update an existing progress entry (e.g. correct a measurement) */
export function useUpdateProgressEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Omit<ProgressEntry, 'id' | 'userId' | 'createdAt'>>
    }) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      // Remove undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
      )

      await updateDoc(doc(db, 'progress-entries', id), {
        ...cleanedData,
        updatedAt: serverTimestamp(),
      })

      await logActivity(userId, 'update', 'profile', id, {
        type: 'progress_entry',
        updates: Object.keys(cleanedData),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-entries'] })
    },
  })
}

/** Soft delete: sets deletedAt instead of removing the document */
export function useDeleteProgressEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      await updateDoc(doc(db, 'progress-entries', id), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await logActivity(userId, 'delete', 'profile', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-entries'] })
    },
  })
}
