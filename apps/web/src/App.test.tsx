import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

describe.skip('App', () => {
  it('renders the landing page on /', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('PrimeFit')
    expect(screen.getByText(/Achieve your fitness goals/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument()
  })

  it('renders the login page on /login', () => {
    window.history.pushState({}, '', '/login')
    render(<App />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sign In to PrimeFit')
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})
