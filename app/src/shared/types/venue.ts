export interface Venue {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  editors: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type VenueCreate = Pick<Venue, 'name' | 'slug'>
