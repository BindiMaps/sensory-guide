import { useState, useCallback, useId, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Guide, Area } from '@/lib/schemas/guideSchema'

interface ImageAssignmentEditorProps {
  guide: Guide
  isOpen: boolean
  onClose: () => void
  onSave: (updatedAreas: Area[]) => Promise<void>
}

// Use unique numeric IDs for images to avoid URL parsing issues
type ImageId = number
type Assignments = Record<string, ImageId[]> // sectionId -> image IDs

interface ImageData {
  id: ImageId
  url: string
}

function initializeState(areas: Area[]): {
  assignments: Assignments
  imageMap: Map<ImageId, string>
  urlToId: Map<string, ImageId>
} {
  const assignments: Assignments = { unassigned: [] }
  const imageMap = new Map<ImageId, string>()
  const urlToId = new Map<string, ImageId>()
  let nextId = 1

  for (const area of areas) {
    assignments[area.id] = []
    for (const url of area.images || []) {
      if (!urlToId.has(url)) {
        imageMap.set(nextId, url)
        urlToId.set(url, nextId)
        nextId++
      }
      assignments[area.id].push(urlToId.get(url)!)
    }
  }

  return { assignments, imageMap, urlToId }
}

function DraggableImage({ id, url }: { id: string; url: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative flex-shrink-0 cursor-grab active:cursor-grabbing rounded-sm overflow-hidden border-2 border-transparent hover:border-[#B8510D] focus:border-[#B8510D] focus:outline-none transition-colors"
      tabIndex={0}
      role="button"
      aria-label="Drag image to reassign"
    >
      <img
        src={url}
        alt="Section image"
        className="h-20 w-auto object-cover"
        loading="lazy"
        draggable={false}
      />
    </div>
  )
}

function ImageOverlay({ url }: { url: string }) {
  return (
    <div className="rounded-sm overflow-hidden shadow-lg ring-2 ring-[#B8510D]">
      <img src={url} alt="Dragging" className="h-20 w-auto object-cover" draggable={false} />
    </div>
  )
}

function DroppableSection({
  sectionId,
  sectionName,
  imageIds,
  imageMap,
  isOver,
}: {
  sectionId: string
  sectionName: string
  imageIds: ImageId[]
  imageMap: Map<ImageId, string>
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: sectionId })
  const sortableIds = imageIds.map((imgId) => `${sectionId}:${imgId}`)

  return (
    <div
      ref={setNodeRef}
      className={`border-b border-[#E8E8E5] py-3 transition-colors ${
        isOver ? 'bg-orange-50 ring-2 ring-[#B8510D] ring-inset' : ''
      }`}
    >
      <h3 className="font-semibold text-[#3D3D3D] text-sm mb-2">{sectionName}</h3>
      <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-2 overflow-x-auto pb-1 min-h-[88px] items-center">
          {imageIds.length === 0 ? (
            <div className="flex items-center justify-center w-full text-sm text-gray-400 italic">
              Drop images here
            </div>
          ) : (
            imageIds.map((imgId) => (
              <DraggableImage
                key={`${sectionId}:${imgId}`}
                id={`${sectionId}:${imgId}`}
                url={imageMap.get(imgId) || ''}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

function parseItemId(itemId: string): { sectionId: string; imageId: ImageId } {
  const colonIdx = itemId.indexOf(':')
  if (colonIdx === -1) {
    return { sectionId: itemId, imageId: -1 }
  }
  return {
    sectionId: itemId.substring(0, colonIdx),
    imageId: parseInt(itemId.substring(colonIdx + 1), 10),
  }
}

export function ImageAssignmentEditor({
  guide,
  isOpen,
  onClose,
  onSave,
}: ImageAssignmentEditorProps) {
  const modalId = useId()

  const initialState = useMemo(() => initializeState(guide.areas), [guide.areas])
  const [assignments, setAssignments] = useState<Assignments>(initialState.assignments)
  const imageMap = initialState.imageMap

  const [activeId, setActiveId] = useState<string | null>(null)
  const [overSectionId, setOverSectionId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const activeUrl = useMemo(() => {
    if (!activeId) return null
    const { imageId } = parseItemId(activeId)
    return imageMap.get(imageId) || null
  }, [activeId, imageMap])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id as string | undefined
    if (overId) {
      // If dropping on another image, get its section; otherwise it's the section ID itself
      const { sectionId } = parseItemId(overId)
      setOverSectionId(sectionId)
    } else {
      setOverSectionId(null)
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setOverSectionId(null)

      if (!over) return

      const activeIdStr = active.id as string
      const overIdStr = over.id as string

      const { sectionId: fromSection, imageId } = parseItemId(activeIdStr)
      const { sectionId: toSection, imageId: overImageId } = parseItemId(overIdStr)

      if (fromSection === toSection) {
        // Reorder within same section
        if (overImageId !== -1 && imageId !== overImageId) {
          setAssignments((prev) => {
            const sectionImages = [...prev[fromSection]]
            const fromIndex = sectionImages.indexOf(imageId)
            const toIndex = sectionImages.indexOf(overImageId)

            if (fromIndex !== -1 && toIndex !== -1) {
              sectionImages.splice(fromIndex, 1)
              sectionImages.splice(toIndex, 0, imageId)
              return { ...prev, [fromSection]: sectionImages }
            }
            return prev
          })
          setIsDirty(true)
        }
        return
      }

      // Move between sections
      setAssignments((prev) => {
        const newAssignments = { ...prev }
        // Remove from source
        newAssignments[fromSection] = prev[fromSection].filter((id) => id !== imageId)
        // Add to target
        newAssignments[toSection] = [...(prev[toSection] || []), imageId]
        return newAssignments
      })
      setIsDirty(true)
    },
    []
  )

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      // Build updated areas with new image assignments
      const updatedAreas = guide.areas.map((area) => ({
        ...area,
        images: (assignments[area.id] || []).map((imgId) => imageMap.get(imgId) || '').filter(Boolean),
      }))
      await onSave(updatedAreas)
      setIsDirty(false)
      onClose()
    } catch (error) {
      console.error('Failed to save image assignments:', error)
    } finally {
      setIsSaving(false)
    }
  }, [assignments, guide.areas, imageMap, onSave, onClose])

  const handleClose = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) {
      return
    }
    onClose()
  }, [isDirty, onClose])

  if (!isOpen) return null

  const hasImages = imageMap.size > 0

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${modalId}-title`}
    >
      <div className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#E8E8E5] flex items-center justify-between flex-shrink-0">
          <h2 id={`${modalId}-title`} className="font-semibold text-[#3D3D3D]">
            Edit Image Assignments
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasImages ? (
            <p className="text-gray-500 text-center py-8">No images to assign</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {/* Unassigned bank */}
              <DroppableSection
                sectionId="unassigned"
                sectionName="Unassigned Images"
                imageIds={assignments.unassigned || []}
                imageMap={imageMap}
                isOver={overSectionId === 'unassigned'}
              />

              {/* Sections */}
              {guide.areas.map((area) => (
                <DroppableSection
                  key={area.id}
                  sectionId={area.id}
                  sectionName={area.name}
                  imageIds={assignments[area.id] || []}
                  imageMap={imageMap}
                  isOver={overSectionId === area.id}
                />
              ))}

              {/* Drag overlay */}
              <DragOverlay>{activeUrl && <ImageOverlay url={activeUrl} />}</DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#E8E8E5] flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 border border-[#DDDDD9] text-[#3D3D3D] rounded-sm hover:bg-gray-50 disabled:opacity-50 font-medium text-sm min-h-[40px] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="px-4 py-2 bg-[#B8510D] text-white rounded-sm hover:bg-[#9A4409] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm min-h-[40px] transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
