import React from 'react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 flex flex-col items-center justify-center text-gray-100">
      <header className="w-full max-w-4xl px-6 py-8 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-gray-100 drop-shadow-lg">
          PrimeFit
        </h1>
        <p className="text-xl mb-8 text-gray-300 max-w-2xl text-center">
          Achieve your fitness goals with personalized plans, progress tracking, and a supportive
          community. Start your journey to a healthier you today!
        </p>
        <a
          href="#get-started"
          className="px-8 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-lg font-semibold shadow-md transition"
        >
          Get Started
        </a>
      </header>
      <main className="flex-1 w-full flex flex-col items-center">
        {/* Hero image or illustration can go here */}
        <div className="mt-12">
          <img src="/hero-fitness.svg" alt="Fitness Hero" className="w-96 max-w-full opacity-80" />
        </div>
      </main>
      <footer className="w-full py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} PrimeFit. All rights reserved.
      </footer>
    </div>
  )
}
