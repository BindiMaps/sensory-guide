import { useState } from 'react'
import { Pencil, MessageSquare } from 'lucide-react'

interface VenueHeaderProps {
  venue: { name: string; slug: string; status: string }
  onNameUpdate: (name: string) => Promise<void>
  onShowFeedback: () => void
}

export function VenueHeader({ venue, onNameUpdate, onShowFeedback }: VenueHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [nameError, setNameError] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)

  const handleStartEditName = () => {
    setEditedName(venue.name)
    setNameError('')
    setNameSuccess(false)
    setIsEditingName(true)
  }

  const handleCancelEditName = () => {
    setIsEditingName(false)
    setEditedName('')
    setNameError('')
  }

  const handleSaveName = async () => {
    const trimmed = editedName.trim()
    if (!trimmed) {
      setNameError('Venue name is required')
      return
    }

    setNameSaving(true)
    setNameError('')

    try {
      await onNameUpdate(trimmed)
      setIsEditingName(false)
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 2500)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Failed to update name')
    } finally {
      setNameSaving(false)
    }
  }

  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        {isEditingName ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold px-2 py-1 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                disabled={nameSaving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') handleCancelEditName()
                }}
              />
              <button
                onClick={handleSaveName}
                disabled={nameSaving}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
              >
                {nameSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEditName}
                disabled={nameSaving}
                className="px-3 py-1.5 border rounded-md hover:bg-accent text-sm"
              >
                Cancel
              </button>
            </div>
            {nameError && (
              <p className="text-sm text-red-600">{nameError}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{venue.name}</h1>
            <button
              onClick={handleStartEditName}
              className="p-1 text-muted-foreground hover:text-foreground rounded"
              title="Edit venue name"
            >
              <Pencil className="h-4 w-4" />
            </button>
            {nameSuccess && (
              <span className="text-sm text-green-600">Name updated</span>
            )}
          </div>
        )}
        <p className="text-muted-foreground">/venue/{venue.slug}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onShowFeedback}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
          title="View feedback"
        >
          <MessageSquare className="h-4 w-4" />
          Feedback
        </button>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            venue.status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {venue.status}
        </span>
      </div>
    </div>
  )
}
