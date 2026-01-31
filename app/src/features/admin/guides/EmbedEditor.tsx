import { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
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
  'tinyurl.com',
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

interface UrlFieldState {
  value: string
  error: string | null
}

type FormState = Record<string, UrlFieldState[]>

/**
 * Modal for editing embed URLs for venue sections.
 * Supports multiple URLs per section.
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
        const urls = embeddings[area.id] || []
        initial[area.id] = urls.length > 0
          ? urls.map((url) => ({ value: url, error: null }))
          : [{ value: '', error: null }] // Always show at least one empty input
      }
      setFormState(initial)
    }
  }, [open, areas, embeddings])

  const handleChange = useCallback((areaId: string, index: number, value: string) => {
    setFormState((prev) => {
      const fields = [...(prev[areaId] || [])]
      fields[index] = { value, error: null }
      return { ...prev, [areaId]: fields }
    })
  }, [])

  const handleBlur = useCallback((areaId: string, index: number) => {
    setFormState((prev) => {
      const fields = [...(prev[areaId] || [])]
      const field = fields[index]
      if (!field) return prev

      const validation = isEmbeddableUrl(field.value)
      fields[index] = {
        ...field,
        error: validation.valid ? null : validation.error || 'Invalid URL',
      }
      return { ...prev, [areaId]: fields }
    })
  }, [])

  const handleAddUrl = useCallback((areaId: string) => {
    setFormState((prev) => {
      const fields = [...(prev[areaId] || [])]
      fields.push({ value: '', error: null })
      return { ...prev, [areaId]: fields }
    })
  }, [])

  const handleRemoveUrl = useCallback((areaId: string, index: number) => {
    setFormState((prev) => {
      const fields = [...(prev[areaId] || [])]
      fields.splice(index, 1)
      // Keep at least one empty input
      if (fields.length === 0) {
        fields.push({ value: '', error: null })
      }
      return { ...prev, [areaId]: fields }
    })
  }, [])

  const hasErrors = Object.values(formState).some((fields) =>
    fields.some((field) => field.error !== null)
  )

  const handleSave = () => {
    // Validate all fields
    let hasValidationErrors = false
    const newState = { ...formState }

    for (const areaId of Object.keys(newState)) {
      newState[areaId] = newState[areaId].map((field) => {
        const validation = isEmbeddableUrl(field.value)
        if (!validation.valid) {
          hasValidationErrors = true
          return { ...field, error: validation.error || 'Invalid URL' }
        }
        return field
      })
    }

    if (hasValidationErrors) {
      setFormState(newState)
      return
    }

    // Build embeddings object, excluding empty values
    const result: Embeddings = {}
    for (const areaId of Object.keys(formState)) {
      const urls = formState[areaId]
        .map((f) => f.value.trim())
        .filter((url) => url.length > 0)
      if (urls.length > 0) {
        result[areaId] = urls
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

        <div className="space-y-6 py-4">
          {areas.map((area) => {
            const fields = formState[area.id] || [{ value: '', error: null }]
            return (
              <div key={area.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {area.name}
                </label>
                {fields.map((field, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={field.value}
                        onChange={(e) => handleChange(area.id, index, e.target.value)}
                        onBlur={() => handleBlur(area.id, index)}
                        placeholder="Paste embed URL (BindiWeb, YouTube, etc.)"
                        aria-label={`${area.name} embed URL ${index + 1}`}
                        aria-invalid={field.error ? 'true' : 'false'}
                        className={`w-full px-3 py-2 text-sm border rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:border-transparent ${
                          field.error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-[#DDDDD9]'
                        }`}
                      />
                      {field.error && (
                        <p className="text-xs text-red-600 mt-1" role="alert">
                          {field.error}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(area.id, index)}
                      className="p-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-sm"
                      aria-label={`Remove URL ${index + 1} from ${area.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddUrl(area.id)}
                  className="inline-flex items-center gap-1 text-sm text-[#B8510D] hover:text-[#9A4410] focus:outline-none focus:ring-2 focus:ring-[#B8510D] rounded-sm px-1"
                >
                  <Plus className="h-3 w-3" />
                  Add another URL
                </button>
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
