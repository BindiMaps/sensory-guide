import { AlertCircle, Clock, Zap, Shield } from 'lucide-react'

interface RateLimitDisplayProps {
  usageToday: number
  usageLimit: number
  isUnlimited?: boolean
  className?: string
}

export function RateLimitDisplay({
  usageToday,
  usageLimit,
  isUnlimited = false,
  className = '',
}: RateLimitDisplayProps) {
  // Superadmins get unlimited
  if (isUnlimited) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
      >
        <Shield className="h-4 w-4 flex-shrink-0" />
        <span>Unlimited admin amount</span>
      </div>
    )
  }

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
  isUnlimited?: boolean
}

/**
 * Full-width blocker shown when rate limit is exhausted
 * Never shown to superadmins (isUnlimited=true)
 */
export function RateLimitBlocker({ usageToday, usageLimit, isUnlimited = false }: RateLimitBlockerProps) {
  // Never block superadmins
  if (isUnlimited) {
    return null
  }

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
