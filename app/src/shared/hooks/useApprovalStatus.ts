import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'

interface ApprovalStatus {
  approved: boolean
  isSuperAdmin: boolean
  needsSetup: boolean
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to check if the current user is approved for venue creation.
 * This is for UX purposes - actual protection is server-side.
 */
export function useApprovalStatus(): ApprovalStatus {
  const { user, initialised } = useAuthStore()
  const [approved, setApproved] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

  const refetch = () => setFetchCount((c) => c + 1)

  useEffect(() => {
    if (!initialised) {
      return
    }

    if (!user || !functions) {
      setApproved(false)
      setIsSuperAdmin(false)
      setNeedsSetup(false)
      setLoading(false)
      return
    }

    const checkApproval = async () => {
      setLoading(true)
      setError(null)

      try {
        const checkApprovalFn = httpsCallable<void, { approved: boolean; isSuperAdmin: boolean; needsSetup: boolean }>(
          functions!,
          'checkApproval'
        )
        const result = await checkApprovalFn()
        setApproved(result.data.approved)
        setIsSuperAdmin(result.data.isSuperAdmin)
        setNeedsSetup(result.data.needsSetup)
      } catch (err) {
        console.error('Failed to check approval status:', err)
        setError('Failed to check approval status')
        // Default to not approved on error (fail secure)
        setApproved(false)
        setIsSuperAdmin(false)
        setNeedsSetup(false)
      } finally {
        setLoading(false)
      }
    }

    checkApproval()
  }, [user, initialised, fetchCount])

  return { approved, isSuperAdmin, needsSetup, loading, error, refetch }
}
