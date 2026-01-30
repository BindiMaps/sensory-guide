/**
 * Sensory level key legend - Design System v5
 * Displays what low/medium/high levels mean
 */
export function SensoryKey() {
  return (
    <footer className="border-t border-[#E8E8E5] pt-6 mt-10 mb-8">
      <p className="text-sm font-semibold text-[#1A1A1A] mb-3">
        Sensory Level Key
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: '#2A6339' }}
            aria-hidden="true"
          />
          <span className="text-sm text-[#3D3D3D]">
            <span className="font-medium">Low</span> — Generally calm
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: '#8A5F08' }}
            aria-hidden="true"
          />
          <span className="text-sm text-[#3D3D3D]">
            <span className="font-medium">Medium</span> — Moderate stimulation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: '#9E3322' }}
            aria-hidden="true"
          />
          <span className="text-sm text-[#3D3D3D]">
            <span className="font-medium">High</span> — Intense or unpredictable
          </span>
        </div>
      </div>
    </footer>
  )
}
