import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VersionHistory } from './VersionHistory'
import type { Version } from './useVersionHistory'

// Mock firebase/functions
const mockHttpsCallable = vi.fn()
vi.mock('firebase/functions', () => ({
  httpsCallable: (...args: unknown[]) => mockHttpsCallable(...args),
}))

// Mock firebase config
vi.mock('@/lib/firebase', () => ({
  functions: {},
}))

// Sample versions for testing
const mockVersions: Version[] = [
  {
    timestamp: '2026-01-29T12:00:00Z',
    previewUrl: 'https://storage.example.com/preview-1',
    size: 2048,
    created: '2026-01-29T12:00:00.000Z',
    isLive: false,
  },
  {
    timestamp: '2026-01-28T10:00:00Z',
    previewUrl: 'https://storage.example.com/preview-2',
    size: 1024,
    created: '2026-01-28T10:00:00.000Z',
    isLive: true,
  },
  {
    timestamp: '2026-01-27T08:00:00Z',
    previewUrl: 'https://storage.example.com/preview-3',
    size: 512,
    created: '2026-01-27T08:00:00.000Z',
    isLive: false,
  },
]

describe('VersionHistory', () => {
  const defaultProps = {
    versions: mockVersions,
    isLoading: false,
    error: null,
    onMakeLive: vi.fn(),
    onPreview: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    render(<VersionHistory {...defaultProps} isLoading={true} versions={[]} />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders error state', () => {
    render(<VersionHistory {...defaultProps} error="Failed to load versions" versions={[]} />)

    expect(screen.getByText(/failed to load versions/i)).toBeInTheDocument()
  })

  it('renders empty state when no versions', () => {
    render(<VersionHistory {...defaultProps} versions={[]} />)

    expect(screen.getByText(/no versions/i)).toBeInTheDocument()
  })

  it('renders all versions with formatted timestamps', () => {
    render(<VersionHistory {...defaultProps} />)

    // Should show all 3 versions
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('shows LIVE badge on the live version', () => {
    render(<VersionHistory {...defaultProps} />)

    const liveLabels = screen.getAllByText('LIVE')
    expect(liveLabels).toHaveLength(1)
  })

  it('disables Make Live button on the live version', () => {
    render(<VersionHistory {...defaultProps} />)

    const makeLiveButtons = screen.getAllByRole('button', { name: /make live/i })

    // Find the button for the live version - should be disabled
    // The live version is at index 1 in our mock data (after sorting)
    expect(makeLiveButtons[1]).toBeDisabled()
  })

  it('enables Make Live button on non-live versions', () => {
    render(<VersionHistory {...defaultProps} />)

    const makeLiveButtons = screen.getAllByRole('button', { name: /make live/i })

    // First and third versions should have enabled buttons
    expect(makeLiveButtons[0]).not.toBeDisabled()
    expect(makeLiveButtons[2]).not.toBeDisabled()
  })

  it('calls onPreview when Preview button is clicked', () => {
    render(<VersionHistory {...defaultProps} />)

    const previewButtons = screen.getAllByRole('button', { name: /preview/i })
    fireEvent.click(previewButtons[0])

    expect(defaultProps.onPreview).toHaveBeenCalledWith(mockVersions[0])
  })

  it('shows confirmation dialog when Make Live is clicked', () => {
    render(<VersionHistory {...defaultProps} />)

    const makeLiveButtons = screen.getAllByRole('button', { name: /make live/i })
    fireEvent.click(makeLiveButtons[0])

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('calls onMakeLive after confirmation', async () => {
    render(<VersionHistory {...defaultProps} />)

    // Click Make Live on first version
    const makeLiveButtons = screen.getAllByRole('button', { name: /make live/i })
    fireEvent.click(makeLiveButtons[0])

    // Confirm in dialog
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(defaultProps.onMakeLive).toHaveBeenCalledWith(mockVersions[0].timestamp)
    })
  })

  it('closes dialog when Cancel is clicked', () => {
    render(<VersionHistory {...defaultProps} />)

    // Open dialog
    const makeLiveButtons = screen.getAllByRole('button', { name: /make live/i })
    fireEvent.click(makeLiveButtons[0])

    // Cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
  })
})
