import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { Loader2 } from 'lucide-react'
import { functions } from '@/lib/firebase'

interface AccessSetupProps {
  onSetupComplete: () => void
}

/**
 * One-time setup component for access control config.
 * Shows when /config/superAdmins doesn't exist yet.
 */
export function AccessSetup({ onSetupComplete }: AccessSetupProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = async () => {
    if (!functions) {
      setError('Firebase Functions not configured')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const seedFn = httpsCallable<void, { success: boolean; message: string }>(
        functions,
        'seedAccessConfig'
      )
      const result = await seedFn()

      if (result.data.success) {
        onSetupComplete()
      }
    } catch (err) {
      console.error('Setup failed:', err)
      const error = err as { code?: string; message?: string }

      if (error.code === 'functions/already-exists') {
        // Config already exists, just refresh
        onSetupComplete()
      } else {
        setError(error.message || 'Setup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded-lg bg-card">
      <h2 className="text-xl font-semibold mb-3">First-Time Setup</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The access control system needs to be initialised. Click below to set yourself up as the first super admin.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleSetup}
        disabled={loading}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Setting up...' : 'Initialise Access Control'}
      </button>
    </div>
  )
}
