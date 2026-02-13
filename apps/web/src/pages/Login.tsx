import React from 'react'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-gray-100">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign In to PrimeFit</h2>
        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-2 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 rounded bg-gray-600 hover:bg-gray-500 font-semibold transition"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-gray-400 text-sm">Or sign in with</div>
        <div className="flex justify-center gap-4 mt-4">
          <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 font-semibold transition">
            Google
          </button>
          <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 font-semibold transition">
            GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
