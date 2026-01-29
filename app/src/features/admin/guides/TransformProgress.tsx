import type { TransformProgressStatus } from '@/lib/schemas/guideSchema'
import { CheckCircle2, Circle, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getStageLabel, getStages, isStageComplete, useTransformProgress } from './useTransformProgress'

/**
 * Rotating messages shown during the long 'analysing' stage
 * Creates perceived progress while LLM processes the document
 * These are intentionally vague/general - rotated randomly to
 * give sense of activity without implying specific progress
 */
const ANALYSING_MESSAGES = [
  'Identifying venue layout...',
  'Mapping sensory environments...',
  'Extracting accessibility features...',
  'Analysing navigation paths...',
  'Reading floor plan details...',
  'Cataloguing quiet zones...',
  'Checking lighting conditions...',
  'Reviewing crowd flow patterns...',
  'Scanning for sensory triggers...',
  'Processing spatial information...',
  'Identifying rest areas...',
  'Mapping emergency exits...',
  'Reviewing accessibility notes...',
  'Analysing ambient sound levels...',
  'Checking surface textures...',
  'Identifying wayfinding elements...',
  'Reviewing facility locations...',
  'Processing signage information...',
  'Mapping transition zones...',
  'Building sensory recommendations...',
  // A few cheeky ones
  'Consulting the oracle...',
  'Teaching AI about vibes...',
  'Asking nicely...',
  'Reticulating splines...',
  'Counting ceiling tiles...',
  'Synergising the data points...',
  'Leveraging machine learnings...',
  'Pivoting to insights...',
  'Disrupting the document...',
  'Aligning the stakeholders...',
  'Circling back on acoustics...',
  'Taking this offline...',
  'Unpacking the floorplan...',
  'Moving the needle...',
  'Boiling the ocean...',
  'Optimising the synergies...',
  'Ideating spatially...',
  'Blue-sky thinking...',
  'Drilling down on doors...',
  'Parking lot-ing the extras...',
  'Low-hanging fruit detected...',
  'Thinking outside the venue...',
  'Going forward, going backward...',
  'Per my last analysis...',
  'As per the attached PDF...',
  'Looping in the algorithms...',
  'Quick win identification...',
  'Running it up the flagpole...',
  'Baking accessibility in...',
  'Socialising the findings...',
  'Deep dive in progress...',
  'Bandwidth check: confirmed...',
  'Value-add processing...',
  'Actioning the document...',
  'Workshopping the layout...',
]

/** Interval between rotating messages (ms) */
const MESSAGE_ROTATION_INTERVAL = 6000

/**
 * Hook for rotating through analysing messages randomly
 */
function useRotatingMessage(isActive: boolean): string {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * ANALYSING_MESSAGES.length)
  )

  useEffect(() => {
    if (!isActive) {
      return
    }

    const interval = setInterval(() => {
      setIndex((prev) => {
        // Pick a random different message
        let next = Math.floor(Math.random() * ANALYSING_MESSAGES.length)
        while (next === prev && ANALYSING_MESSAGES.length > 1) {
          next = Math.floor(Math.random() * ANALYSING_MESSAGES.length)
        }
        return next
      })
    }, MESSAGE_ROTATION_INTERVAL)

    return () => clearInterval(interval)
  }, [isActive])

  return ANALYSING_MESSAGES[index]
}

/**
 * Gentle pulsing indicator for long-running stages
 * More calming than a spinning loader
 */
function PulsingIndicator({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block h-5 w-5 rounded-full bg-primary ${className ?? ''}`}
      style={{
        animation: 'gentle-pulse 3s ease-in-out infinite',
      }}
      aria-hidden="true"
    />
  )
}

interface TransformProgressProps {
  venueId: string
  logId: string
  onComplete?: (outputPath: string) => void
  onRetry?: () => void
}

export function TransformProgress({
  venueId,
  logId,
  onComplete,
  onRetry,
}: TransformProgressProps) {
  const { progress, loading, error } = useTransformProgress(venueId, logId)

  // Call onComplete when ready - must be in useEffect to avoid calling setState during render
  useEffect(() => {
    if (progress?.status === 'ready' && progress.outputPath && onComplete) {
      onComplete(progress.outputPath)
    }
  }, [progress?.status, progress?.outputPath, onComplete])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading progress...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 px-4 py-3 rounded-md">
        Error loading progress: {error}
      </div>
    )
  }

  if (!progress) {
    return null
  }

  const stages = getStages()
  const isFailed = progress.status === 'failed'
  const isComplete = progress.status === 'ready'

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isFailed ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-primary'
            }`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {/* Stages */}
      <div className="space-y-2">
        {stages.map((stage) => (
          <StageItem
            key={stage}
            stage={stage}
            currentStatus={progress.status}
            retryCount={progress.retryCount}
          />
        ))}
      </div>

      {/* Retry info */}
      {progress.retryCount && progress.retryCount > 0 && !isFailed && (
        <div className="text-sm text-amber-600 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retrying... (attempt {progress.retryCount + 1} of 3)
        </div>
      )}

      {/* Error state */}
      {isFailed && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 space-y-3">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Transform failed</p>
              <p className="text-sm text-red-700 mt-1">
                {progress.error || 'An unexpected error occurred'}
              </p>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          )}
        </div>
      )}

      {/* Success state */}
      {isComplete && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="font-medium text-green-800">
              Guide generated successfully!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

interface StageItemProps {
  stage: TransformProgressStatus
  currentStatus: TransformProgressStatus
  retryCount?: number
}

function StageItem({ stage, currentStatus, retryCount }: StageItemProps) {
  const isActive = stage === currentStatus && currentStatus !== 'ready' && currentStatus !== 'failed'
  const isCompleted = isStageComplete(currentStatus, stage) || currentStatus === 'ready'
  const isFailed = currentStatus === 'failed'
  const isAnalysing = stage === 'analysing' && isActive

  // Rotating message for long-running analysing stage
  const rotatingMessage = useRotatingMessage(isAnalysing)

  const label = isAnalysing ? rotatingMessage : getStageLabel(stage)

  // Show retry indicator on analysing stage
  const showRetry = stage === 'analysing' && isActive && retryCount && retryCount > 0

  // Determine which indicator to show
  const renderIndicator = () => {
    if (isCompleted) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    }
    if (isAnalysing) {
      // Calming pulsing indicator for the long stage
      return <PulsingIndicator />
    }
    if (isActive) {
      // Regular spinner for quick stages
      return <Loader2 className="h-5 w-5 text-primary animate-spin" />
    }
    if (isFailed && stage === currentStatus) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    return <Circle className="h-5 w-5" />
  }

  return (
    <div
      className={`flex items-center gap-3 py-1 ${isActive ? 'text-foreground font-medium' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'
        }`}
    >
      {renderIndicator()}
      <div className="flex flex-col">
        <span>{label}</span>
        {/* Time expectation for analysing stage */}
        {isAnalysing && (
          <span className="text-xs text-muted-foreground font-normal">
            This step can take a few minutes
          </span>
        )}
      </div>
      {showRetry && (
        <span className="text-xs text-amber-600">(retry {retryCount})</span>
      )}
    </div>
  )
}
