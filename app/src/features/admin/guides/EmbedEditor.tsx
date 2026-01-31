import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import type { Area } from '@/lib/schemas/guideSchema'
import type { Embeddings } from './useEmbeddings'

// Allowed domains for embedding content
const ALLOWED_EMBED_DOMAINS = [
  'bindiweb.com',
  'youtube.com',
  'youtube-nocookie.com',
  'www.youtube.com',
  'vimeo.com',
  'player.vimeo.com',
  'google.com',
  'maps.google.com',
  'www.google.com',
]

export function isEmbeddableUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) {
    return { valid: true } // Empty is allowed (means "remove embed")
  }

  try {
    const parsed = new URL(url)

    // Must be https
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'URL must use HTTPS' }
    }

    // Check domain allowlist
    const isAllowed = ALLOWED_EMBED_DOMAINS.some(
      (domain) =>
        parsed.hostname === domain ||
        parsed.hostname.endsWith(`.${domain}`)
    )

    if (!isAllowed) {
      return { valid: false, error: 'Domain not supported for embedding' }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

interface EmbedEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  areas: Area[]
  embeddings: Embeddings
  onSave: (embeddings: Embeddings) => void
  isSaving: boolean
}

interface FieldState {
  value: string
  error: string | null
  touched: boolean
}

type FormState = Record<string, FieldState>

/**
 * Modal for editing embed URLs for venue sections.
 * Shows an input field for each area in the guide.
 */
export function EmbedEditor({
  open,
  onOpenChange,
  areas,
  embeddings,
  onSave,
  isSaving,
}: EmbedEditorProps) {
  const [formState, setFormState] = useState<FormState>({})

  // Initialize form state from embeddings when dialog opens
  useEffect(() => {
    if (open) {
      const initial: FormState = {}
      for (const area of areas) {
        initial[area.id] = {
          value: embeddings[area.id] || '',
          error: null,
          touched: false,
        }
      }
      setFormState(initial)
    }
  }, [open, areas, embeddings])

  const handleChange = useCallback((areaId: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [areaId]: {
        value,
        error: null, // Clear error on change
        touched: true,
      },
    }))
  }, [])

  const handleBlur = useCallback((areaId: string) => {
    setFormState((prev) => {
      const field = prev[areaId]
      if (!field) return prev

      const validation = isEmbeddableUrl(field.value)
      return {
        ...prev,
        [areaId]: {
          ...field,
          error: validation.valid ? null : validation.error || 'Invalid URL',
        },
      }
    })
  }, [])

  const hasErrors = Object.values(formState).some((field) => field.error !== null)

  const handleSave = () => {
    // Validate all fields
    let hasValidationErrors = false
    const newState = { ...formState }

    for (const areaId of Object.keys(newState)) {
      const validation = isEmbeddableUrl(newState[areaId].value)
      if (!validation.valid) {
        newState[areaId] = {
          ...newState[areaId],
          error: validation.error || 'Invalid URL',
        }
        hasValidationErrors = true
      }
    }

    if (hasValidationErrors) {
      setFormState(newState)
      return
    }

    // Build embeddings object, excluding empty values
    const result: Embeddings = {}
    for (const areaId of Object.keys(formState)) {
      const value = formState[areaId].value.trim()
      if (value) {
        result[areaId] = value
      }
    }

    onSave(result)
  }

  const handleCancel = () => {
    if (!isSaving) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={isSaving ? undefined : onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Section Embeds</DialogTitle>
          <DialogDescription>
            Add embed URLs (BindiWeb maps, YouTube videos, etc.) for each section.
            These persist across PDF re-uploads.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {areas.map((area) => {
            const field = formState[area.id] || { value: '', error: null, touched: false }
            return (
              <div key={area.id} className="space-y-1">
                <label
                  htmlFor={`embed-${area.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {area.name}
                </label>
                <input
                  id={`embed-${area.id}`}
                  type="url"
                  value={field.value}
                  onChange={(e) => handleChange(area.id, e.target.value)}
                  onBlur={() => handleBlur(area.id)}
                  placeholder="Paste embed URL (BindiWeb, YouTube, etc.)"
                  aria-label={`${area.name} embed URL`}
                  aria-invalid={field.error ? 'true' : 'false'}
                  aria-describedby={field.error ? `error-${area.id}` : undefined}
                  className={`w-full px-3 py-2 text-sm border rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:border-transparent ${
                    field.error
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[#DDDDD9]'
                  }`}
                />
                {field.error && (
                  <p id={`error-${area.id}`} className="text-xs text-red-600" role="alert">
                    {field.error}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || hasErrors}
            className="inline-flex items-center justify-center rounded-md bg-[#B8510D] px-4 py-2 text-sm font-medium text-white hover:bg-[#9A4410] focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Embeds'
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
