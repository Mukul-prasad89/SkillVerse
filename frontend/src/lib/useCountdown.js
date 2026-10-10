import { useEffect, useRef, useState } from 'react'

// Shared countdown: start(17) ticks down to 0 and holds; stop() clears.
export function useCountdown() {
  const [seconds, setSeconds] = useState(null)
  const timer = useRef(null)
  const start = (n = 17) => {
    clearInterval(timer.current)
    setSeconds(n)
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s === null || s <= 0) {
          clearInterval(timer.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }
  const stop = () => {
    clearInterval(timer.current)
    timer.current = null
    setSeconds(null)
  }
  useEffect(() => () => clearInterval(timer.current), [])
  return { seconds, start, stop, active: seconds !== null }
}
