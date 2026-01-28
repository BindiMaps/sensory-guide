import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'
import type { Venue } from '@/shared/types/venue'

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const userEmail = user?.email

  useEffect(() => {
    if (!userEmail || !db) {
      setVenues([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    const venuesRef = collection(db, 'venues')
    const q = query(
      venuesRef,
      where('editors', 'array-contains', userEmail),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const venueData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Venue[]
        setVenues(venueData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching venues:', err)
        setError('Failed to load venues')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userEmail])

  return { venues, loading, error }
}
