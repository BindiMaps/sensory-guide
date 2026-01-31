import { initializeApp } from 'firebase-admin/app'

// Initialize Firebase Admin SDK
initializeApp()

// Export callable functions
export { getSignedUploadUrl } from './storage/getSignedUploadUrl'
export { transformPdf } from './transforms/transformPdf'
export { publishGuide } from './admin/publishGuide'
export { createVenue } from './admin/createVenue'
export { checkApproval } from './admin/checkApproval'
export { getAllowList, addToAllowList, removeFromAllowList } from './admin/manageAllowList'
export { seedAccessConfig } from './admin/seedAccessConfig'
export { listVersions } from './admin/listVersions'
export { setLiveVersion } from './admin/setLiveVersion'
export { deleteVersion } from './admin/deleteVersion'
