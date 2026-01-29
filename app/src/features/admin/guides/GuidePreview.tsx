import { MapPin, Clock, Phone, Building2, DoorOpen, Accessibility } from 'lucide-react'
import type { Guide } from '@/lib/schemas/guideSchema'
import { CategoryBadge } from './CategoryBadge'
import { PreviewSection } from './PreviewSection'
import { SuggestionsPanel } from './SuggestionsPanel'

interface GuidePreviewProps {
  guide: Guide
  onPublish?: () => void
  onReupload?: () => void
  isPublishing?: boolean
}

/**
 * Full preview of a generated guide
 * Renders exactly as end users will see it
 */
export function GuidePreview({
  guide,
  onPublish,
  onReupload,
  isPublishing = false,
}: GuidePreviewProps) {
  const { venue, areas, facilities, suggestions, categories } = guide

  // Sort areas by order
  const sortedAreas = [...areas].sort((a, b) => a.order - b.order)

  // Format date for display
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="space-y-6">
      {/* Venue Header */}
      <header className="border-b pb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{venue.name}</h2>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          {venue.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{venue.address}</span>
            </div>
          )}
          {venue.contact && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{venue.contact}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>Updated {formatDate(venue.lastUpdated)}</span>
          </div>
        </div>

        <p className="text-foreground leading-relaxed mb-4">{venue.summary}</p>

        {/* Category badges overview */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <CategoryBadge key={category} category={category} />
            ))}
          </div>
        )}
      </header>

      {/* Areas/Zones */}
      <section>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <Building2 className="h-5 w-5" aria-hidden="true" />
          Areas & Zones
        </h3>
        <div className="space-y-3">
          {sortedAreas.map((area) => (
            <PreviewSection key={area.id} area={area} />
          ))}
        </div>
      </section>

      {/* Facilities */}
      {(facilities.exits.length > 0 ||
        facilities.bathrooms.length > 0 ||
        facilities.quietZones.length > 0) && (
        <section className="border rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
            <Accessibility className="h-5 w-5" aria-hidden="true" />
            Facilities
          </h3>

          <div className="space-y-4">
            {facilities.exits.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 font-medium text-foreground mb-2">
                  <DoorOpen className="h-4 w-4" aria-hidden="true" />
                  Exits
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {facilities.exits.map((exit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span aria-hidden="true">•</span>
                      <span>
                        {exit.description}
                        {exit.mapUrl && (
                          <a
                            href={exit.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary hover:underline"
                          >
                            View map
                          </a>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {facilities.bathrooms.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Bathrooms</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {facilities.bathrooms.map((bathroom, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span aria-hidden="true">•</span>
                      <span>
                        {bathroom.description}
                        {bathroom.mapUrl && (
                          <a
                            href={bathroom.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary hover:underline"
                          >
                            View map
                          </a>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {facilities.quietZones.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Quiet Zones</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {facilities.quietZones.map((zone, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{zone.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Suggestions Panel */}
      <SuggestionsPanel suggestions={suggestions} />

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px]"
        >
          {isPublishing ? 'Publishing...' : 'Publish Guide'}
        </button>
        <button
          type="button"
          onClick={onReupload}
          disabled={isPublishing}
          className="px-4 py-2 border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          Re-upload PDF
        </button>
      </div>
    </div>
  )
}
