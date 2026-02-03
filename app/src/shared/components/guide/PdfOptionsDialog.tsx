import { useEffect, useRef } from 'react'
import { getCategoryColours } from '@/shared/utils/colours'

export type PdfFilterMode = 'none' | 'highlighted' | 'filtered'

interface PdfOptionsDialogProps {
  /** Categories the user has filtered by */
  activeCategories: string[]
  /** Called when user selects an option */
  onSelect: (mode: PdfFilterMode) => void
  /** Called when dialog should close without action */
  onCancel: () => void
}

/**
 * Dialog to choose PDF generation mode when filters are active
 */
export function PdfOptionsDialog({ activeCategories, onSelect, onCancel }: PdfOptionsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    firstButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onCancel])

  const categoryLabels = activeCategories.join(', ')

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="PDF export options"
        aria-modal="true"
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
          Export personalised guide
        </h2>
        <p className="text-sm text-[#595959] mb-4">
          You have filters active. Choose how to include them in your PDF:
        </p>

        {/* Active filters display */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {activeCategories.map((category) => {
            const colours = getCategoryColours(category)
            return (
              <span
                key={category}
                className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-sm"
                style={{ backgroundColor: colours.bg, color: colours.text }}
              >
                {category}
              </span>
            )
          })}
        </div>

        {/* Options */}
        <div className="space-y-3">
          <button
            ref={firstButtonRef}
            type="button"
            onClick={() => onSelect('highlighted')}
            className="w-full text-left p-4 border border-[#DDDDD9] rounded hover:border-[#B8510D] hover:bg-[#FEF7F2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D]"
          >
            <div className="font-medium text-[#1A1A1A] mb-1">Full guide (highlighted)</div>
            <div className="text-sm text-[#595959]">
              All content included. {categoryLabels} sections are highlighted.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelect('filtered')}
            className="w-full text-left p-4 border border-[#DDDDD9] rounded hover:border-[#B8510D] hover:bg-[#FEF7F2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D]"
          >
            <div className="font-medium text-[#1A1A1A] mb-1">My sensitivities only</div>
            <div className="text-sm text-[#595959]">
              Only sections with {categoryLabels} warnings. Shorter, focused PDF.
            </div>
          </button>
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full py-2 text-sm text-[#595959] hover:text-[#1A1A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
