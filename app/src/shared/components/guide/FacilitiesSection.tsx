import type { Guide } from '@/lib/schemas/guideSchema'

interface FacilitiesSectionProps {
  facilities: Guide['facilities']
}

/**
 * Facilities section - Design System v5
 * Displays exits, bathrooms, and quiet zones
 */
export function FacilitiesSection({ facilities }: FacilitiesSectionProps) {
  const hasAnyFacilities =
    facilities.exits.length > 0 ||
    facilities.bathrooms.length > 0 ||
    facilities.quietZones.length > 0

  if (!hasAnyFacilities) return null

  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">
        Facilities
      </h2>

      <div className="space-y-4">
        {facilities.exits.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-[#1A1A1A] mb-1.5">
              Exits
            </h3>
            <ul className="space-y-1">
              {facilities.exits.map((exit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#3D3D3D]">
                  <span aria-hidden="true" className="text-[#595959]">•</span>
                  <span>
                    {exit.description}
                    {exit.mapUrl && (
                      <a
                        href={exit.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-[#B8510D] hover:underline"
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
            <h3 className="font-semibold text-sm text-[#1A1A1A] mb-1.5">
              Bathrooms
            </h3>
            <ul className="space-y-1">
              {facilities.bathrooms.map((bathroom, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#3D3D3D]">
                  <span aria-hidden="true" className="text-[#595959]">•</span>
                  <span>
                    {bathroom.description}
                    {bathroom.mapUrl && (
                      <a
                        href={bathroom.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-[#B8510D] hover:underline"
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
            <h3 className="font-semibold text-sm text-[#1A1A1A] mb-1.5">
              Quiet Zones
            </h3>
            <ul className="space-y-1">
              {facilities.quietZones.map((zone, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#3D3D3D]">
                  <span aria-hidden="true" className="text-[#595959]">•</span>
                  <span>{zone.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
