import { useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  ImageLightboxContext,
  useOptionalImageLightbox,
  type LightboxImage,
  type ImageLightboxContextValue,
} from './useImageLightbox'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'

interface ImageLightboxProviderProps {
  children: ReactNode
  /** Callback when an image is opened (for analytics) */
  onImageOpen?: (image: LightboxImage, index: number) => void
}

/**
 * Provider for image lightbox functionality
 * Wrap around GuideContent to enable clickable images with navigation
 */
export function ImageLightboxProvider({ children, onImageOpen }: ImageLightboxProviderProps) {
  const [images, setImages] = useState<LightboxImage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  // Ref to access current images without causing re-renders
  const imagesRef = useRef(images)
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  // Ref for onImageOpen callback
  const onImageOpenRef = useRef(onImageOpen)
  useEffect(() => {
    onImageOpenRef.current = onImageOpen
  }, [onImageOpen])

  const registerImage = useCallback((image: LightboxImage) => {
    setImages((prev) => {
      // Avoid duplicates (same URL)
      if (prev.some((i) => i.url === image.url)) return prev
      return [...prev, image]
    })
  }, [])

  const unregisterImage = useCallback((url: string) => {
    setImages((prev) => prev.filter((i) => i.url !== url))
  }, [])

  const openAt = useCallback((url: string) => {
    const idx = imagesRef.current.findIndex((i) => i.url === url)
    if (idx !== -1) {
      setCurrentIndex(idx)
      setIsOpen(true)
      // Call analytics callback
      const image = imagesRef.current[idx]
      if (onImageOpenRef.current && image) {
        onImageOpenRef.current(image, idx)
      }
    }
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const goNext = useCallback(() => {
    const len = imagesRef.current.length
    if (len > 0) setCurrentIndex((prev) => (prev + 1) % len)
  }, [])

  const goPrev = useCallback(() => {
    const len = imagesRef.current.length
    if (len > 0) setCurrentIndex((prev) => (prev - 1 + len) % len)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          goPrev()
          break
        case 'ArrowRight':
          e.preventDefault()
          goNext()
          break
        case 'Escape':
          // Radix handles this, but ensure we close
          close()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, goNext, goPrev, close])

  const currentImage = images[currentIndex]

  const value: ImageLightboxContextValue = useMemo(() => ({
    images,
    registerImage,
    unregisterImage,
    openAt,
    isOpen,
    currentIndex,
  }), [images, registerImage, unregisterImage, openAt, isOpen, currentIndex])

  return (
    <ImageLightboxContext.Provider value={value}>
      {children}

      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={`fixed inset-0 z-50 bg-black/90 ${
              prefersReducedMotion
                ? ''
                : 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
            }`}
          />
          <DialogPrimitive.Content
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 focus:outline-none ${
              prefersReducedMotion
                ? ''
                : 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
            }`}
            aria-describedby={undefined}
          >
            {currentImage && (
              <>
                {/* Header: section title + counter + close */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 text-white">
                  <div className="flex-1 min-w-0">
                    <DialogPrimitive.Title className="text-lg font-semibold truncate">
                      {currentImage.sectionTitle}
                    </DialogPrimitive.Title>
                    {images.length > 1 && (
                      <p className="text-sm text-white/70">
                        {currentIndex + 1} of {images.length}
                      </p>
                    )}
                  </div>
                  <DialogPrimitive.Close
                    className="ml-4 p-2 rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/90"
                    aria-label="Close lightbox"
                  >
                    <X className="w-6 h-6" />
                  </DialogPrimitive.Close>
                </div>

                {/* Image */}
                <img
                  src={currentImage.url}
                  alt={currentImage.alt}
                  className="max-w-full max-h-[calc(100vh-160px)] object-contain rounded"
                />

                {/* Navigation buttons - only show if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/90"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/90"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Bottom hint for keyboard users */}
                {images.length > 1 && (
                  <p className="absolute bottom-4 text-sm text-white/50">
                    Use arrow keys to navigate
                  </p>
                )}
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ImageLightboxContext.Provider>
  )
}

interface ClickableImageProps {
  src: string
  alt: string
  sectionTitle: string
  className?: string
}

/**
 * Image that registers itself with the lightbox and opens on click
 * Use this instead of raw <img> within an ImageLightboxProvider
 */
export function ClickableImage({ src, alt, sectionTitle, className }: ClickableImageProps) {
  const lightbox = useOptionalImageLightbox()

  // Extract stable functions to avoid re-running effect when other context values change
  const registerImage = lightbox?.registerImage
  const unregisterImage = lightbox?.unregisterImage
  const openAt = lightbox?.openAt

  // Register/unregister with lightbox - only depends on stable callbacks
  useEffect(() => {
    if (!registerImage || !unregisterImage) return
    registerImage({ url: src, alt, sectionTitle })
    return () => unregisterImage(src)
  }, [registerImage, unregisterImage, src, alt, sectionTitle])

  const handleClick = () => {
    openAt?.(src)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  // If no lightbox provider, just render a regular image
  if (!lightbox) {
    return <img src={src} alt={alt} className={className} loading="lazy" />
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2 rounded flex-shrink-0 snap-start"
      aria-label={`View ${alt} in fullscreen`}
    >
      <img src={src} alt={alt} className={className} loading="lazy" />
    </button>
  )
}
