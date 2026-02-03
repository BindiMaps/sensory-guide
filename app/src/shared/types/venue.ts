export interface Venue {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  editors: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  liveVersion?: string // Timestamp of live version (e.g., "2026-01-28T10:30:00Z")
  draftVersion?: string // Timestamp of unpublished draft (if any)
  extractedVenueName?: string // Venue name extracted from PDF (populated on publish)
}

export type VenueCreate = Pick<Venue, 'name' | 'slug'>
