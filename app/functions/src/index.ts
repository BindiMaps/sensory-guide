import { initializeApp } from 'firebase-admin/app'

// Initialize Firebase Admin SDK
initializeApp()

// Export callable functions
export { getSignedUploadUrl } from './storage/getSignedUploadUrl'
export { transformPdf } from './transforms/transformPdf'
