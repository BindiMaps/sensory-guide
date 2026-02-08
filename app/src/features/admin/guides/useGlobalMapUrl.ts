import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface UseGlobalMapUrlResult {
  globalMapUrl: string
  isLoading: boolean
  save: (url: string) => Promise<void>
}

/**
 * Hook to read/write the globalMapUrl field on a venue Firestore doc.
 * Merged into guide.venue.mapUrl at publish time.
 */
export function useGlobalMapUrl(venueId: string | undefined): UseGlobalMapUrlResult {
  const [globalMapUrl, setGlobalMapUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!venueId || !db) {
      setGlobalMapUrl('')
      setIsLoading(false)
      return
    }

    let cancelled = false
    const firestore = db

    const fetchMapUrl = async () => {
      setIsLoading(true)
      try {
        const venueRef = doc(firestore, 'venues', venueId)
        const snap = await getDoc(venueRef)
        if (!cancelled && snap.exists()) {
          setGlobalMapUrl((snap.data().globalMapUrl as string) || '')
        }
      } catch (err) {
        console.error('Error fetching globalMapUrl:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchMapUrl()
    return () => { cancelled = true }
  }, [venueId])

  const save = useCallback(async (url: string) => {
    if (!venueId || !db) throw new Error('No venue ID')
    const venueRef = doc(db, 'venues', venueId)
    await updateDoc(venueRef, { globalMapUrl: url || '' })
    setGlobalMapUrl(url || '')
  }, [venueId])

  return { globalMapUrl, isLoading, save }
}
