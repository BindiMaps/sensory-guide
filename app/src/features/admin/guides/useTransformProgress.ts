import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { TransformProgressStatus } from '@/lib/schemas/guideSchema'

export interface TransformProgressData {
  status: TransformProgressStatus
  progress: number
  error?: string
  outputPath?: string
  retryCount?: number
}

interface UseTransformProgressResult {
  progress: TransformProgressData | null
  loading: boolean
  error: string | null
}

/**
 * Hook to listen to transform progress updates in real-time
 * Uses Firestore onSnapshot for live updates
 */
export function useTransformProgress(
  venueId: string | undefined,
  logId: string | undefined
): UseTransformProgressResult {
  const [progress, setProgress] = useState<TransformProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!venueId || !logId || !db) {
      setLoading(false)
      return
    }

    const progressRef = doc(db, 'venues', venueId, 'progress', logId)

    const unsubscribe = onSnapshot(
      progressRef,
      (snapshot) => {
        setLoading(false)
        if (snapshot.exists()) {
          const data = snapshot.data() as TransformProgressData
          setProgress(data)
          setError(null)
        } else {
          setProgress(null)
        }
      },
      (err) => {
        setLoading(false)
        setError(err.message)
        console.error('Progress listener error:', err)
      }
    )

    return () => unsubscribe()
  }, [venueId, logId])

  return { progress, loading, error }
}

/**
 * Get human-readable stage name
 */
export function getStageLabel(status: TransformProgressStatus): string {
  const labels: Record<TransformProgressStatus, string> = {
    uploaded: 'Processing PDF',
    extracting: 'Extracting text',
    analysing: 'Analysing content',
    generating: 'Generating guide',
    ready: 'Ready',
    failed: 'Failed',
  }
  return labels[status]
}

/**
 * Get all stages in order
 */
export function getStages(): TransformProgressStatus[] {
  return ['uploaded', 'extracting', 'analysing', 'generating', 'ready']
}

/**
 * Check if a stage is complete
 */
export function isStageComplete(
  currentStatus: TransformProgressStatus,
  checkStatus: TransformProgressStatus
): boolean {
  const stages = getStages()
  const currentIndex = stages.indexOf(currentStatus)
  const checkIndex = stages.indexOf(checkStatus)
  return checkIndex < currentIndex
}
