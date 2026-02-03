import { useState } from 'react'

interface DeleteVenueSectionProps {
  venueName: string
  onDelete: () => Promise<void>
}

export function DeleteVenueSection({ venueName, onDelete }: DeleteVenueSectionProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDeleteVenue = async () => {
    if (deleteConfirmName !== venueName) {
      return
    }

    setDeleting(true)

    try {
      await onDelete()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete venue')
      setDeleting(false)
    }
  }

  return (
    <section className="border border-red-200 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>

      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
        >
          Delete Venue
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-red-700">
            This will permanently delete <strong>{venueName}</strong> and all its data.
            Type the venue name to confirm:
          </p>
          <input
            type="text"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            placeholder={venueName}
            className="w-full px-3 py-2 border border-red-300 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={deleting}
          />
          <div className="flex gap-2">
            <button
              onClick={handleDeleteVenue}
              disabled={deleting || deleteConfirmName !== venueName}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false)
                setDeleteConfirmName('')
              }}
              className="px-4 py-2 border rounded-md hover:bg-accent"
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
