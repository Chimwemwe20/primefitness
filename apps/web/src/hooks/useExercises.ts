import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Exercise } from '@repo/shared/schemas'

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const q = query(
        collection(db, 'exercises'),
        where('isPublic', '==', true),
        orderBy('name', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs
        .filter(d => !d.data().deletedAt)
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as Exercise & { id: string }
        })
    },
  })
}

export function useExercisesByCategory(category: string) {
  return useQuery({
    queryKey: ['exercises', category],
    queryFn: async () => {
      const q = query(
        collection(db, 'exercises'),
        where('isPublic', '==', true),
        where('category', '==', category),
        orderBy('name', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs
        .filter(d => !d.data().deletedAt)
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as Exercise & { id: string }
        })
    },
    enabled: !!category,
  })
}
