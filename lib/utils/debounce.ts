/**
 * Debounce Utility
 * Prevents race conditions by delaying function execution until after a specified delay
 */

type DebouncedFunction<T extends (...args: unknown[]) => Promise<unknown>> = {
  (...args: Parameters<T>): void
  cancel: () => void
}

const timers = new Map<string, NodeJS.Timeout>()

/**
 * Debounce an async function with a unique key
 * Multiple calls with the same key within the delay period will cancel previous calls
 */
export function debounce<T extends (...args: unknown[]) => Promise<unknown>>(
  key: string,
  fn: T,
  delay: number
): DebouncedFunction<T> {
  const debouncedFn = (...args: Parameters<T>): void => {
    // Clear existing timer for this key
    const existingTimer = timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new timer
    const timer = setTimeout(() => {
      fn(...args).catch((error) => {
        console.error(`Debounced function error [${key}]:`, error)
      })
      timers.delete(key)
    }, delay)

    timers.set(key, timer)
  }

  debouncedFn.cancel = () => {
    const timer = timers.get(key)
    if (timer) {
      clearTimeout(timer)
      timers.delete(key)
    }
  }

  return debouncedFn
}

/**
 * Cancel all pending debounced calls
 */
export function cancelAllDebounced(): void {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
}
