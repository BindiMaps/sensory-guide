import { AlertCircle, Clock, Zap } from 'lucide-react'

interface RateLimitDisplayProps {
  usageToday: number
  usageLimit: number
  className?: string
}

export function RateLimitDisplay({
  usageToday,
  usageLimit,
  className = '',
}: RateLimitDisplayProps) {
  const remaining = usageLimit - usageToday
  const isLow = remaining === 1
  const isExhausted = remaining <= 0

  if (isExhausted) {
    return (
      <div
        className={`flex items-center gap-2 text-sm px-3 py-2 bg-red-50 text-red-700 rounded-md ${className}`}
      >
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>
          Daily limit reached ({usageToday}/{usageLimit}).{' '}
          <span className="text-red-600">Resets at midnight UTC.</span>
        </span>
      </div>
    )
  }

  if (isLow) {
    return (
      <div
        className={`flex items-center gap-2 text-sm px-3 py-2 bg-amber-50 text-amber-700 rounded-md ${className}`}
      >
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>
          <strong>1 transform remaining</strong> today ({usageToday}/{usageLimit})
        </span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
    >
      <Zap className="h-4 w-4 flex-shrink-0" />
      <span>
        {remaining} of {usageLimit} transforms remaining today
      </span>
    </div>
  )
}

interface RateLimitBlockerProps {
  usageToday: number
  usageLimit: number
}

/**
 * Full-width blocker shown when rate limit is exhausted
 */
export function RateLimitBlocker({ usageToday, usageLimit }: RateLimitBlockerProps) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center space-y-3">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
      <h3 className="text-lg font-semibold text-red-800">
        Daily limit reached
      </h3>
      <p className="text-red-700">
        You have used all {usageLimit} transforms for today ({usageToday}/{usageLimit}).
      </p>
      <p className="text-sm text-red-600">
        Your limit will reset at midnight UTC. Come back tomorrow to create more guides.
      </p>
    </div>
  )
}
