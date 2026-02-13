import '@testing-library/jest-dom'

// Mock firebase modules to bypass real initialization in tests
import { vi } from 'vitest'
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(() => () => {}),
}))
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}))
