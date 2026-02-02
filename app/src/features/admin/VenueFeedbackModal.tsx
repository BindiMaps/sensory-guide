import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { useVenueFeedback, type TimeRange } from './useVenueFeedback'

interface VenueFeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venueId: string
  venueName: string
}

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '1w', label: '1 week' },
  { value: '2w', label: '2 weeks' },
  { value: '4w', label: '4 weeks' },
  { value: 'all', label: 'All time' },
]

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function VenueFeedbackModal({
  open,
  onOpenChange,
  venueId,
  venueName,
}: VenueFeedbackModalProps) {
  const { feedback, loading, error, timeRange, setTimeRange, refetch } =
    useVenueFeedback(open ? venueId : undefined)

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Feedback: {venueName}</DialogTitle>
        </DialogHeader>

        {/* Time Range Toggle */}
        <div className="flex gap-1 border-b pb-3">
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeRangeChange(option.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                timeRange === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : !feedback ? null : feedback.thumbsUp === 0 &&
            feedback.thumbsDown === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-lg mb-2">No feedback yet</p>
              <p className="text-sm">
                Your guide is live! Check back after users visit to see how
                it's performing.
              </p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Thumbs Counts */}
              <div className="flex gap-4 justify-center">
                <div className="flex-1 max-w-[140px] text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-3xl font-bold text-green-700">
                    👍 {feedback.thumbsUp}
                  </div>
                  <div className="text-sm text-green-600 mt-1">Helpful</div>
                </div>
                <div className="flex-1 max-w-[140px] text-center p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="text-3xl font-bold text-red-700">
                    👎 {feedback.thumbsDown}
                  </div>
                  <div className="text-sm text-red-600 mt-1">Not helpful</div>
                </div>
              </div>

              {/* Comments */}
              {feedback.comments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Comments ({feedback.comments.length})
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {feedback.comments.map((comment, index) => (
                      <div
                        key={index}
                        className="p-3 bg-muted/30 rounded-lg border"
                      >
                        <p className="text-sm text-foreground">
                          "{comment.text}"
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>
                            {comment.feedback === 'up' ? '👍' : '👎'}
                          </span>
                          <span>{formatRelativeTime(comment.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
