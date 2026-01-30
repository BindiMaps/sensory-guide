import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { Loader2 } from 'lucide-react'
import { functions } from '@/lib/firebase'

interface AllowListManagerProps {
  onClose?: () => void
}

export function AllowListManager({ onClose }: AllowListManagerProps) {
  const [emails, setEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load the current allow-list
  useEffect(() => {
    const loadAllowList = async () => {
      if (!functions) {
        setError('Functions not configured')
        setLoading(false)
        return
      }

      try {
        const getAllowListFn = httpsCallable<void, { emails: string[] }>(
          functions,
          'getAllowList'
        )
        const result = await getAllowListFn()
        setEmails(result.data.emails)
      } catch (err) {
        console.error('Failed to load allow-list:', err)
        const error = err as { code?: string; message?: string }
        if (error.code === 'functions/permission-denied') {
          setError('You do not have permission to view the allow-list')
        } else {
          setError('Failed to load allow-list')
        }
      } finally {
        setLoading(false)
      }
    }

    loadAllowList()
  }, [])

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const email = newEmail.trim().toLowerCase()
    if (!email) return

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (emails.map((e) => e.toLowerCase()).includes(email)) {
      setError('This email is already in the list')
      return
    }

    if (!functions) {
      setError('Functions not configured')
      return
    }

    setAdding(true)

    try {
      const addToAllowListFn = httpsCallable<
        { email: string },
        { success: boolean; emails: string[] }
      >(functions, 'addToAllowList')
      const result = await addToAllowListFn({ email })
      setEmails(result.data.emails)
      setNewEmail('')
    } catch (err) {
      console.error('Failed to add email:', err)
      setError('Failed to add email')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveEmail = async (email: string) => {
    if (!functions) {
      setError('Functions not configured')
      return
    }

    setRemoving(email)
    setError(null)

    try {
      const removeFromAllowListFn = httpsCallable<
        { email: string },
        { success: boolean; emails: string[] }
      >(functions, 'removeFromAllowList')
      const result = await removeFromAllowListFn({ email })
      setEmails(result.data.emails)
    } catch (err) {
      console.error('Failed to remove email:', err)
      setError('Failed to remove email')
    } finally {
      setRemoving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading allow-list...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Approved Users</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Only users on this list (and super admins) can create new venues.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add email form */}
      <form onSubmit={handleAddEmail} className="flex gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="email@example.com"
          className="flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          disabled={adding}
        />
        <button
          type="submit"
          disabled={adding || !newEmail.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {adding ? 'Adding...' : 'Add'}
        </button>
      </form>

      {/* Email list */}
      <div className="border rounded-md divide-y">
        {emails.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No approved users yet. Add emails above.
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email}
              className="flex justify-between items-center px-4 py-3"
            >
              <span className="text-sm">{email}</span>
              <button
                onClick={() => handleRemoveEmail(email)}
                disabled={removing === email}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {removing === email ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Note: Removing a user from this list does not affect their existing venues.
        They will still be able to edit venues they already have access to.
      </p>
    </div>
  )
}
