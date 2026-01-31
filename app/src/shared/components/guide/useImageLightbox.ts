import { createContext, useContext } from 'react'

/** Image with its section context for navigation */
export interface LightboxImage {
  url: string
  alt: string
  sectionTitle: string
}

export interface ImageLightboxContextValue {
  /** All images in the guide */
  images: LightboxImage[]
  /** Register an image (call on mount) */
  registerImage: (image: LightboxImage) => void
  /** Unregister an image (call on unmount) */
  unregisterImage: (url: string) => void
  /** Open lightbox at specific image */
  openAt: (url: string) => void
  /** Current open state */
  isOpen: boolean
  /** Current image index */
  currentIndex: number
}

export const ImageLightboxContext = createContext<ImageLightboxContextValue | null>(null)

/** Hook to access lightbox context - throws if used outside provider */
export function useImageLightbox() {
  const context = useContext(ImageLightboxContext)
  if (!context) {
    throw new Error('useImageLightbox must be used within ImageLightboxProvider')
  }
  return context
}

/** Optional hook that returns null if no provider (for optional lightbox support) */
export function useOptionalImageLightbox() {
  return useContext(ImageLightboxContext)
}
