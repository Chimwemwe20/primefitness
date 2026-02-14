import { useState, useMemo } from 'react'
import { useWorkoutSessions } from '../../hooks/useWorkoutSessions'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Calendar as CalendarIcon,
} from 'lucide-react'

export default function Calendar() {
  const { data: workouts, isLoading } = useWorkoutSessions()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Group workouts by date
  const workoutsByDate = useMemo(() => {
    const map = new Map<string, typeof workouts>()
    workouts?.forEach(workout => {
      const dateKey = new Date(workout.startTime).toDateString()
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(workout)
    })
    return map
  }, [workouts])

  const getDayWorkouts = (day: number) => {
    const date = new Date(year, month, day)
    return workoutsByDate.get(date.toDateString()) || []
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    )
  }

  const selectedDayWorkouts = selectedDate
    ? workoutsByDate.get(selectedDate.toDateString()) || []
    : []

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Calculate calendar days including padding
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-neutral-100">Workout Calendar</h1>
          <p className="text-neutral-400">View your workout schedule at a glance</p>
        </div>
        <Button onClick={goToToday} variant="outline" className="border-neutral-700">
          <CalendarIcon size={20} className="mr-2" />
          Today
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-neutral-900 border-neutral-800 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{monthName}</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-neutral-700"
                onClick={previousMonth}
              >
                <ChevronLeft size={20} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-neutral-700"
                onClick={nextMonth}
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            </div>
          ) : (
            <>
              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-neutral-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }

                  const dayWorkouts = getDayWorkouts(day)
                  const hasWorkouts = dayWorkouts.length > 0

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(year, month, day))}
                      className={`aspect-square p-2 rounded-lg transition-colors ${
                        isSelected(day)
                          ? 'bg-blue-500 text-white'
                          : isToday(day)
                            ? 'bg-neutral-800 border-2 border-blue-500'
                            : hasWorkouts
                              ? 'bg-neutral-800 hover:bg-neutral-700'
                              : 'hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-sm font-medium mb-1">{day}</span>
                        {hasWorkouts && (
                          <div className="flex gap-1">
                            {dayWorkouts.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected(day) ? 'bg-white' : 'bg-blue-500'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </Card>

        {/* Selected Day Details */}
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <h3 className="font-bold mb-4">
            {selectedDate
              ? selectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Select a date'}
          </h3>

          {selectedDate && selectedDayWorkouts.length > 0 ? (
            <div className="space-y-3">
              {selectedDayWorkouts.map(workout => (
                <div
                  key={workout.id}
                  className="p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/workouts/${workout.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Dumbbell className="text-blue-500" size={16} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{workout.title}</h4>
                      <p className="text-xs text-neutral-400">
                        {new Date(workout.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <div className="flex gap-3 mt-2 text-xs text-neutral-500">
                        <span>{workout.exercises?.length || 0} exercises</span>
                        {workout.duration && <span>{workout.duration} min</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedDate ? (
            <div className="text-center py-8 text-neutral-500">
              <p>No workouts on this day</p>
              <Button
                size="sm"
                className="mt-4 bg-blue-500 hover:bg-blue-600"
                onClick={() => (window.location.href = '/workouts/log')}
              >
                Log Workout
              </Button>
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">Click on a date to view workouts</p>
          )}
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card className="bg-neutral-900 border-neutral-800 p-6 mt-6">
        <h3 className="font-bold mb-4">Monthly Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-neutral-400 mb-1">Total Workouts</p>
            <p className="text-2xl font-bold">
              {workouts?.filter(w => {
                const workoutDate = new Date(w.startTime)
                return workoutDate.getMonth() === month && workoutDate.getFullYear() === year
              }).length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-400 mb-1">Total Time</p>
            <p className="text-2xl font-bold">
              {workouts
                ?.filter(w => {
                  const workoutDate = new Date(w.startTime)
                  return workoutDate.getMonth() === month && workoutDate.getFullYear() === year
                })
                .reduce((acc, w) => acc + (w.duration || 0), 0) || 0}
              <span className="text-sm text-neutral-500 ml-1">min</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-400 mb-1">Days Active</p>
            <p className="text-2xl font-bold">{workoutsByDate.size}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400 mb-1">Avg Per Workout</p>
            <p className="text-2xl font-bold">
              {workouts && workouts.length > 0
                ? Math.round(
                    workouts
                      .filter(w => {
                        const workoutDate = new Date(w.startTime)
                        return (
                          workoutDate.getMonth() === month && workoutDate.getFullYear() === year
                        )
                      })
                      .reduce((acc, w) => acc + (w.duration || 0), 0) /
                      workouts.filter(w => {
                        const workoutDate = new Date(w.startTime)
                        return (
                          workoutDate.getMonth() === month && workoutDate.getFullYear() === year
                        )
                      }).length
                  )
                : 0}
              <span className="text-sm text-neutral-500 ml-1">min</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
