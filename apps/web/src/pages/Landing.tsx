import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../packages/ui/components/ui/button'
import { Card } from '../../../../packages/ui/components/ui/card'

export default function FitnessLanding() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    setIsVisible(true)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigateToAuth = () => navigate('/auth')

  return (
    <div className="bg-black text-neutral-100 font-sans overflow-x-hidden relative">
      {/* Heavy grain overlay */}
      <div className="grain"></div>

      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none z-[90]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      ></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-neutral-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div
              className={`flex items-center gap-2 sm:gap-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900 flex items-center justify-center border-2 border-neutral-700 relative overflow-hidden">
                <span className="bebas text-2xl sm:text-3xl text-neutral-200 relative z-10">F</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
              </div>
              <span className="bebas text-xl sm:text-3xl text-neutral-100 tracking-[0.15em]">
                PRIME<span className="text-neutral-600">FITNESS</span>
              </span>
            </div>

            <div
              className={`hidden md:flex items-center gap-8 lg:gap-12 text-sm font-medium tracking-wider transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            >
              <a
                href="#programs"
                className="text-neutral-500 hover:text-neutral-100 transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-neutral-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                PROGRAMS
              </a>
              <a
                href="#transform"
                className="text-neutral-500 hover:text-neutral-100 transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-neutral-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                TRANSFORM
              </a>
              <a
                href="#join"
                className="text-neutral-500 hover:text-neutral-100 transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-neutral-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                JOIN
              </a>
            </div>

            <div
              className={`flex items-center gap-3 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            >
              <Button
                onClick={navigateToAuth}
                className="hidden sm:inline-flex px-5 py-2.5 bg-transparent text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/50 border-2 border-neutral-800 hover:border-neutral-600 transition-all duration-300 text-sm font-bold bebas tracking-[0.15em] rounded-none"
              >
                SIGN IN
              </Button>
              <Button
                onClick={navigateToAuth}
                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-neutral-200 text-black hover:bg-neutral-100 transition-all duration-300 text-sm font-bold bebas tracking-[0.15em] rounded-none shadow-lg hover:shadow-neutral-200/20 hover:shadow-2xl"
              >
                START NOW
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Dramatic Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-neutral-900"></div>

          <div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-neutral-700 rounded-full blur-[120px] opacity-10 animate-float"
            style={{
              animationDelay: '0s',
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-neutral-600 rounded-full blur-[120px] opacity-10 animate-float"
            style={{
              animationDelay: '2s',
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          ></div>

          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(163, 163, 163, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(163, 163, 163, 0.5) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center relative z-10">
          <div
            className="space-y-8 sm:space-y-10 lg:space-y-12"
            style={{
              opacity: Math.max(1 - scrollY / 600, 0.3),
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          >
            <div className="space-y-6 sm:space-y-8">
              <div
                className={`inline-block px-4 py-2 bg-neutral-900/80 border-2 border-neutral-800 text-neutral-400 text-xs font-bold tracking-[0.2em] backdrop-blur-sm transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                REDEFINE YOUR LIMITS
              </div>

              <h1
                className={`bebas text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-[0.85] text-neutral-100 tracking-tight transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
              >
                PUSH
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-600 via-neutral-500 to-neutral-700">
                  BEYOND
                </span>
              </h1>

              <p
                className={`text-lg sm:text-xl text-neutral-400 max-w-xl font-light leading-relaxed transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
              >
                Transform your body and mind with science-backed training programs designed for
                athletes who refuse to settle for average.
              </p>
            </div>

            <div
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <Button
                onClick={navigateToAuth}
                className="group px-8 py-4 sm:px-10 sm:py-5 bg-neutral-200 text-black hover:bg-neutral-100 transition-all duration-300 bebas text-xl tracking-[0.15em] relative overflow-hidden w-full sm:w-auto rounded-none shadow-xl hover:shadow-2xl hover:shadow-neutral-200/10 border-2 border-transparent hover:border-neutral-300"
              >
                <span className="relative z-10">GET STARTED FREE</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
              <Button
                variant="outline"
                className="px-8 py-4 sm:px-10 sm:py-5 border-2 border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100 hover:bg-neutral-900/50 transition-all duration-300 bebas text-xl tracking-[0.15em] w-full sm:w-auto rounded-none backdrop-blur-sm"
              >
                VIEW PROGRAMS
              </Button>
            </div>
          </div>

          <div
            className={`relative h-[500px] sm:h-[600px] lg:h-[700px] mt-12 lg:mt-0 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            style={{
              transform: `translateY(${scrollY * 0.15}px) ${isVisible ? 'scale(1)' : 'scale(0.9)'}`,
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
              <svg viewBox="0 0 500 500" className="w-full h-full">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#525252" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#737373" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#525252" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <g className="opacity-40">
                  <line
                    x1="100"
                    y1="100"
                    x2="400"
                    y2="100"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    style={{ animation: 'draw-line 2s ease-out forwards', animationDelay: '0.5s' }}
                  />
                  <line
                    x1="400"
                    y1="100"
                    x2="400"
                    y2="400"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    style={{ animation: 'draw-line 2s ease-out forwards', animationDelay: '0.7s' }}
                  />
                  <line
                    x1="400"
                    y1="400"
                    x2="100"
                    y2="400"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    style={{ animation: 'draw-line 2s ease-out forwards', animationDelay: '0.9s' }}
                  />
                  <line
                    x1="100"
                    y1="400"
                    x2="100"
                    y2="100"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    style={{ animation: 'draw-line 2s ease-out forwards', animationDelay: '1.1s' }}
                  />
                  <line
                    x1="100"
                    y1="100"
                    x2="400"
                    y2="400"
                    stroke="#525252"
                    strokeWidth="1"
                    opacity="0.3"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    style={{ animation: 'draw-line 2s ease-out forwards', animationDelay: '1.3s' }}
                  />
                  <line
                    x1="400"
                    y1="100"
                    x2="100"
                    y2="400"
                    stroke="#525252"
                    strokeWidth="1"
                    opacity="0.3"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    style={{ animation: 'draw-line 2s ease-out forwards', animationDelay: '1.5s' }}
                  />
                </g>
                <circle
                  cx="100"
                  cy="100"
                  r="8"
                  fill="#a3a3a3"
                  className="animate-float"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(163, 163, 163, 0.6))' }}
                />
                <circle
                  cx="400"
                  cy="100"
                  r="8"
                  fill="#a3a3a3"
                  className="animate-float"
                  style={{
                    animationDelay: '1s',
                    filter: 'drop-shadow(0 0 8px rgba(163, 163, 163, 0.6))',
                  }}
                />
                <circle
                  cx="400"
                  cy="400"
                  r="8"
                  fill="#a3a3a3"
                  className="animate-float"
                  style={{
                    animationDelay: '2s',
                    filter: 'drop-shadow(0 0 8px rgba(163, 163, 163, 0.6))',
                  }}
                />
                <circle
                  cx="100"
                  cy="400"
                  r="8"
                  fill="#a3a3a3"
                  className="animate-float"
                  style={{
                    animationDelay: '3s',
                    filter: 'drop-shadow(0 0 8px rgba(163, 163, 163, 0.6))',
                  }}
                />
                <circle
                  cx="250"
                  cy="250"
                  r="10"
                  fill="#e5e5e5"
                  className="animate-float"
                  style={{
                    animationDelay: '1.5s',
                    filter: 'drop-shadow(0 0 12px rgba(229, 229, 229, 0.8))',
                  }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        id="programs"
        className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-neutral-950 to-black relative"
      >
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(163, 163, 163, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(163, 163, 163, 0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        ></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <h2 className="bebas text-5xl sm:text-6xl lg:text-7xl text-neutral-100 mb-4 sm:mb-6 tracking-tight">
              TRAINING SYSTEM
            </h2>
            <p className="text-neutral-500 text-lg sm:text-xl font-light max-w-2xl mx-auto px-4">
              Everything you need to achieve peak performance
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: 'CUSTOM PROGRAMS',
                desc: 'Workout plans that adapt to your progress and goals as you train.',
                num: '01',
              },
              {
                title: 'TRACK EVERYTHING',
                desc: 'Log your workouts, track your lifts, and monitor your body composition over time.',
                num: '02',
              },
              {
                title: 'STAY CONSISTENT',
                desc: 'Build habits with streaks, reminders, and a training schedule that fits your life.',
                num: '03',
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="feature-card p-8 sm:p-10 bg-neutral-950/80 border-2 border-neutral-900 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:border-neutral-800 backdrop-blur-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-neutral-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center mb-6 sm:mb-8 group-hover:border-neutral-700 transition-all duration-300">
                    <div className="bebas text-3xl sm:text-4xl text-neutral-600 group-hover:text-neutral-500 transition-colors">
                      {feature.num}
                    </div>
                  </div>
                  <h3 className="bebas text-2xl sm:text-3xl text-neutral-100 mb-3 sm:mb-4 tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-base sm:text-lg text-neutral-500 font-light leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Transformation Section */}
      <div
        id="transform"
        className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-black"
      >
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(163, 163, 163, 0.5) 100px, rgba(163, 163, 163, 0.5) 101px)',
          }}
        ></div>

        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-neutral-900/30 to-transparent"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <h2 className="bebas text-6xl sm:text-7xl lg:text-8xl text-neutral-100 mb-6 sm:mb-8 leading-[0.9] tracking-tight">
              YOUR
              <br />
              TRANSFORMATION
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-700 via-neutral-600 to-neutral-800">
                STARTS HERE
              </span>
            </h2>
            <p className="text-neutral-400 text-lg sm:text-xl font-light mb-8 sm:mb-10 leading-relaxed max-w-xl">
              Build the training habit that sticks. Track your workouts, follow structured programs,
              and see your progress over time — all completely free.
            </p>
            <Button
              onClick={navigateToAuth}
              className="px-10 py-4 sm:px-12 sm:py-5 bg-neutral-200 text-black hover:bg-neutral-100 transition-all duration-300 bebas text-xl sm:text-2xl tracking-[0.15em] w-full sm:w-auto rounded-none shadow-xl hover:shadow-2xl hover:shadow-neutral-200/10 border-2 border-transparent hover:border-neutral-300 group relative overflow-hidden"
            >
              <span className="relative z-10">START YOUR JOURNEY</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        id="join"
        className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-neutral-950 relative"
      >
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(163, 163, 163, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(163, 163, 163, 0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      {/* Footer */}
      <footer className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-t-2 border-neutral-900 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bebas text-2xl sm:text-3xl text-neutral-700 mb-4 tracking-[0.15em]">
            PRIME FITNESS
          </div>
          <p className="text-neutral-700 text-sm sm:text-base font-light">
            © {new Date().getFullYear()} Prime Fitness. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
