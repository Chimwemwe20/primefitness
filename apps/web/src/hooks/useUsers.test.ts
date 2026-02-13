import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useUsers, useUser, useCreateUser } from './useUsers'
import * as firestore from 'firebase/firestore'
import type {
  QuerySnapshot,
  DocumentSnapshot,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore'

// Mock firebase/firestore
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore')
  return {
    ...actual,
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    addDoc: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    serverTimestamp: vi.fn(),
  }
})

// Mock ../lib/activity
vi.mock('../lib/activity', () => ({
  logActivity: vi.fn(),
}))

// Mock ../lib/firebase
vi.mock('../lib/firebase', () => ({
  db: {},
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user list data', async () => {
    const mockUsers = [
      { uid: 'user-1', email: 'user1@example.com', name: 'User One' },
      { uid: 'user-2', email: 'user2@example.com', name: 'User Two' },
    ]

    vi.mocked(firestore.getDocs).mockResolvedValue({
      docs: mockUsers.map(user => ({
        id: user.uid,
        data: () => user,
      })),
    } as unknown as QuerySnapshot<DocumentData>)

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data).toEqual(mockUsers)
  })
})

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns single user by id', async () => {
    const mockUser = { uid: 'user-1', email: 'user1@example.com', name: 'User One' }

    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      id: 'user-1',
      data: () => mockUser,
    } as unknown as DocumentSnapshot<DocumentData>)

    const { result } = renderHook(() => useUser('user-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockUser)
  })
})

describe('useCreateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates user and returns data', async () => {
    const newUser = { email: 'new@example.com', name: 'New User' }
    const mockDocRef = { id: 'new-user-id' }

    vi.mocked(firestore.addDoc).mockResolvedValue(
      mockDocRef as unknown as DocumentReference<DocumentData>
    )

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync(newUser)

    expect(firestore.addDoc).toHaveBeenCalled()
    expect(firestore.collection).toHaveBeenCalled()
  })
})
