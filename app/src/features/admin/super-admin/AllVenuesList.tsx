import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Search, X } from 'lucide-react'
import { useAllVenues, type VenueListItem } from './useAllVenues'

/**
 * Display editors list, truncating if more than 3.
 */
function EditorsList({ editors }: { editors: string[] }) {
  if (editors.length === 0) {
    return <span className="text-muted-foreground italic">No editors</span>
  }

  const MAX_DISPLAY = 3
  const displayed = editors.slice(0, MAX_DISPLAY)
  const remaining = editors.length - MAX_DISPLAY

  return (
    <span className="text-sm text-muted-foreground">
      {displayed.join(', ')}
      {remaining > 0 && <span className="text-xs"> +{remaining} more</span>}
    </span>
  )
}

/**
 * Status badge component.
 */
function StatusBadge({ status }: { status: VenueListItem['status'] }) {
  const classes =
    status === 'published'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${classes}`}>
      {status}
    </span>
  )
}

export function AllVenuesList() {
  const { venues, loading, error } = useAllVenues()
  const [search, setSearch] = useState('')

  // Filter venues by search term (case-insensitive)
  const filteredVenues = useMemo(() => {
    if (!search.trim()) return venues

    const term = search.toLowerCase()
    return venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(term) ||
        venue.slug.toLowerCase().includes(term)
    )
  }, [venues, search])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading all venues...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 px-4 py-3 rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search venues by name..."
          aria-label="Search venues"
          className="w-full pl-10 pr-10 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredVenues.length} of {venues.length} venue{venues.length !== 1 ? 's' : ''}
        {search && ' matching search'}
      </p>

      {/* Venue list */}
      {filteredVenues.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            {search ? 'No venues match your search' : 'No venues in the system yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredVenues.map((venue) => (
            <Link
              key={venue.id}
              to={`/admin/venues/${venue.id}`}
              className="block p-4 border rounded-lg hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold truncate">{venue.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">/{venue.slug}</p>
                  <div className="mt-2">
                    <EditorsList editors={venue.editors} />
                  </div>
                </div>
                <StatusBadge status={venue.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
