import { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, X, AlertTriangle, ArrowRight } from 'lucide-react'
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
import type { OrphanedEmbed } from './embedMatcher'
import { isEmbeddableUrl } from './embedUrlValidation'

interface EmbedEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  areas: Area[]
  embeddings: Embeddings
  orphaned: OrphanedEmbed[]
  onSave: (embeddings: Embeddings) => void
  onResolveOrphan: (originalId: string, targetAreaId: string | null) => void
  isSaving: boolean
}

interface UrlFieldState {
  value: string
  error: string | null
}

type FormState = Record<string, UrlFieldState[]>

/**
 * Modal for editing embed URLs for venue sections.
 * Supports multiple URLs per section and orphan resolution.
 */
export function EmbedEditor({
  open,
  onOpenChange,
  areas,
  embeddings,
  orphaned,
  onSave,
  onResolveOrphan,
  isSaving,
}: EmbedEditorProps) {
  const [formState, setFormState] = useState<FormState>({})
  const [orphanTargets, setOrphanTargets] = useState<Record<string, string>>({})

  // Initialize form state from embeddings when dialog opens
  useEffect(() => {
    if (open) {
      const initial: FormState = {}
      for (const area of areas) {
        const urls = embeddings[area.id] || []
        initial[area.id] = urls.length > 0
          ? urls.map((url) => ({ value: url, error: null }))
          : [{ value: '', error: null }]
      }
      setFormState(initial)

      // Pre-select suggested matches for orphans
      const targets: Record<string, string> = {}
      for (const o of orphaned) {
        if (o.suggestedAreaId) {
          targets[o.originalId] = o.suggestedAreaId
        }
      }
      setOrphanTargets(targets)
    }
  }, [open, areas, embeddings, orphaned])

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
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Orphaned embeds section */}
          {orphaned.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-3">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {orphaned.length} unmatched embed{orphaned.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-amber-700">
                These embeds were saved for sections that no longer exist. Reassign or delete them.
              </p>
              {orphaned.map((orphan) => (
                <div key={orphan.originalId} className="bg-white rounded p-2 space-y-2">
                  <div className="text-sm font-medium text-gray-900">{orphan.title}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {orphan.urls[0]}
                    {orphan.urls.length > 1 && ` +${orphan.urls.length - 1} more`}
                  </div>
                  {orphan.suggestedAreaId && (
                    <div className="text-xs text-amber-700 flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      Suggested: {orphan.suggestedAreaName}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <select
                      value={orphanTargets[orphan.originalId] || ''}
                      onChange={(e) =>
                        setOrphanTargets((prev) => ({ ...prev, [orphan.originalId]: e.target.value }))
                      }
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Select section...</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onResolveOrphan(orphan.originalId, orphanTargets[orphan.originalId] || null)}
                      disabled={!orphanTargets[orphan.originalId]}
                      className="px-2 py-1 text-xs bg-amber-600 text-white rounded disabled:opacity-50"
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      onClick={() => onResolveOrphan(orphan.originalId, null)}
                      className="px-2 py-1 text-xs text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section embeds */}
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
