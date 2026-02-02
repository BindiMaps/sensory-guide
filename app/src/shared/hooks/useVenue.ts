import { useEffect, useState, useCallback } from 'react'
import { doc, onSnapshot, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Venue } from '@/shared/types/venue'

export function useVenue(venueId: string | undefined) {
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!venueId || !db) {
      setVenue(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    const venueRef = doc(db, 'venues', venueId)

    const unsubscribe = onSnapshot(
      venueRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setVenue({
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Venue)
        } else {
          setVenue(null)
          setError('Venue not found')
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching venue:', err)
        setError('Failed to load venue')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [venueId])

  const addEditor = useCallback(async (email: string) => {
    if (!venueId || !venue || !db) throw new Error('No venue loaded')
    if (venue.editors.length >= 5) throw new Error('Maximum 5 editors per venue')
    if (venue.editors.includes(email)) throw new Error('This person is already an editor')

    const venueRef = doc(db, 'venues', venueId)
    await updateDoc(venueRef, {
      editors: arrayUnion(email),
      updatedAt: serverTimestamp(),
    })
  }, [venueId, venue])

  const removeEditor = useCallback(async (email: string) => {
    if (!venueId || !venue || !db) throw new Error('No venue loaded')
    if (venue.editors.length <= 1) throw new Error('Cannot remove the last editor')

    const venueRef = doc(db, 'venues', venueId)
    await updateDoc(venueRef, {
      editors: arrayRemove(email),
      updatedAt: serverTimestamp(),
    })
  }, [venueId, venue])

  const deleteVenue = useCallback(async () => {
    if (!venueId || !db) throw new Error('No venue loaded')

    const venueRef = doc(db, 'venues', venueId)
    await deleteDoc(venueRef)
  }, [venueId])

  const updateName = useCallback(async (newName: string) => {
    if (!venueId || !db) throw new Error('No venue loaded')
    const trimmed = newName.trim()
    if (!trimmed) throw new Error('Venue name is required')

    const venueRef = doc(db, 'venues', venueId)
    await updateDoc(venueRef, {
      name: trimmed,
      updatedAt: serverTimestamp(),
    })
  }, [venueId])

  return { venue, loading, error, addEditor, removeEditor, deleteVenue, updateName }
}
