import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AllVenuesList } from './AllVenuesList'
import { useAllVenues, type VenueListItem } from './useAllVenues'

// Mock the hook
vi.mock('./useAllVenues', () => ({
  useAllVenues: vi.fn(),
}))

const mockVenues: VenueListItem[] = [
  {
    id: 'venue-1',
    name: 'Adelaide Railway Station',
    slug: 'adelaide-railway-station',
    status: 'published',
    editors: ['alice@example.com', 'bob@example.com'],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-20T14:00:00Z',
  },
  {
    id: 'venue-2',
    name: 'Sydney Opera House',
    slug: 'sydney-opera-house',
    status: 'draft',
    editors: ['curator@museum.au'],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-18T16:00:00Z',
  },
  {
    id: 'venue-3',
    name: 'Melbourne Museum',
    slug: 'melbourne-museum',
    status: 'published',
    editors: ['admin@bindimaps.com', 'editor@test.com', 'user1@example.com', 'user2@example.com'],
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-01-15T16:00:00Z',
  },
]

function renderComponent() {
  return render(
    <BrowserRouter>
      <AllVenuesList />
    </BrowserRouter>
  )
}

describe('AllVenuesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state', () => {
    vi.mocked(useAllVenues).mockReturnValue({
      venues: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    expect(screen.getByText(/loading all venues/i)).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(useAllVenues).mockReturnValue({
      venues: [],
      loading: false,
      error: 'You do not have permission to view all venues',
      refetch: vi.fn(),
    })

    renderComponent()

    expect(screen.getByText(/you do not have permission/i)).toBeInTheDocument()
  })

  it('shows empty state when no venues', () => {
    vi.mocked(useAllVenues).mockReturnValue({
      venues: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    expect(screen.getByText(/no venues in the system yet/i)).toBeInTheDocument()
  })

  it('renders all venues', () => {
    vi.mocked(useAllVenues).mockReturnValue({
      venues: mockVenues,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    expect(screen.getByText('Adelaide Railway Station')).toBeInTheDocument()
    expect(screen.getByText('Sydney Opera House')).toBeInTheDocument()
    expect(screen.getByText('Melbourne Museum')).toBeInTheDocument()
  })

  it('shows venue slugs', () => {
    vi.mocked(useAllVenues).mockReturnValue({
      venues: mockVenues,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    expect(screen.getByText('/adelaide-railway-station')).toBeInTheDocument()
    expect(screen.getByText('/sydney-opera-house')).toBeInTheDocument()
  })

  it('shows venue status badges', () => {
    vi.mocked(useAllVenues).mockReturnValue({
      venues: mockVenues,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    expect(screen.getAllByText('published')).toHaveLength(2)
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('shows editors list', () => {
    vi.mocked(useAllVenues).mockReturnValue({
      venues: mockVenues,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    expect(screen.getByText('alice@example.com, bob@example.com')).toBeInTheDocument()
    expect(screen.getByText('curator@museum.au')).toBeInTheDocument()
  })

  it('truncates long editor lists with +N more', () => {
    vi.mocked(useAllVenues).mockReturnValue({
      venues: mockVenues,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    // Melbourne Museum has 4 editors, should show 3 + "+1 more"
    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })

  it('filters venues by search term', async () => {
    const user = userEvent.setup()
    vi.mocked(useAllVenues).mockReturnValue({
      venues: mockVenues,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    const searchInput = screen.getByPlaceholderText(/search venues/i)
    await user.type(searchInput, 'adelaide')

    expect(screen.getByText('Adelaide Railway Station')).toBeInTheDocument()
    expect(screen.queryByText('Sydney Opera House')).not.toBeInTheDocument()
    expect(screen.queryByText('Melbourne Museum')).not.toBeInTheDocument()
  })

  it('shows no matches message when search has no results', async () => {
    const user = userEvent.setup()
    vi.mocked(useAllVenues).mockReturnValue({
      venues: mockVenues,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    const searchInput = screen.getByPlaceholderText(/search venues/i)
    await user.type(searchInput, 'nonexistent venue')

    expect(screen.getByText(/no venues match your search/i)).toBeInTheDocument()
  })

  it('clears search when clear button clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(useAllVenues).mockReturnValue({
      venues: mockVenues,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    const searchInput = screen.getByPlaceholderText(/search venues/i)
    await user.type(searchInput, 'adelaide')

    expect(screen.queryByText('Sydney Opera House')).not.toBeInTheDocument()

    const clearButton = screen.getByLabelText(/clear search/i)
    await user.click(clearButton)

    expect(screen.getByText('Sydney Opera House')).toBeInTheDocument()
    expect(searchInput).toHaveValue('')
  })

  it('shows venue count', () => {
    vi.mocked(useAllVenues).mockReturnValue({
      venues: mockVenues,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    expect(screen.getByText(/3 of 3 venues/i)).toBeInTheDocument()
  })

  it('links to venue detail page', () => {
    vi.mocked(useAllVenues).mockReturnValue({
      venues: [mockVenues[0]],
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderComponent()

    const link = screen.getByRole('link', { name: /adelaide railway station/i })
    expect(link).toHaveAttribute('href', '/admin/venues/venue-1')
  })
})
