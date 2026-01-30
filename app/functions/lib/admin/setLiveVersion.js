"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLiveVersion = void 0;
exports.setLiveVersionHandler = setLiveVersionHandler;
const https_1 = require("firebase-functions/v2/https");
const storage_1 = require("firebase-admin/storage");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("../middleware/auth");
/**
 * Internal handler for testing - contains the actual logic.
 */
async function setLiveVersionHandler(request) {
    // 1. Auth check
    const userEmail = (0, auth_1.requireAuth)(request);
    // 2. Validate input
    const { venueId, timestamp } = request.data;
    if (!venueId || typeof venueId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'venueId is required');
    }
    if (!timestamp || typeof timestamp !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'timestamp is required');
    }
    // 3. Check editor access
    await (0, auth_1.requireEditorAccess)(userEmail, venueId);
    // 4. Get venue data for slug
    const db = (0, firestore_1.getFirestore)();
    const venueRef = db.collection('venues').doc(venueId);
    const venueSnap = await venueRef.get();
    if (!venueSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Venue not found');
    }
    const venueData = venueSnap.data();
    const slug = venueData?.slug;
    if (!slug) {
        throw new https_1.HttpsError('internal', 'Venue has no slug configured');
    }
    // 5. Verify version exists in Storage
    const storage = (0, storage_1.getStorage)();
    const bucket = storage.bucket();
    const versionPath = `venues/${venueId}/versions/${timestamp}.json`;
    const versionFile = bucket.file(versionPath);
    const [exists] = await versionFile.exists();
    if (!exists) {
        throw new https_1.HttpsError('not-found', `Version ${timestamp} not found`);
    }
    try {
        // 6. Copy to public slug-based path
        const publicPath = `public/guides/${slug}.json`;
        const publicFile = bucket.file(publicPath);
        await versionFile.copy(publicFile);
        await publicFile.makePublic();
        // 7. Also keep the versioned file public (for admin version history preview)
        await versionFile.makePublic();
        // 8. Update Firestore venue doc with liveVersion pointer
        await venueRef.update({
            liveVersion: timestamp,
            status: 'published',
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 9. Construct public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${publicPath}`;
        console.log(`Version made live: venue=${venueId}, version=${timestamp}, user=${userEmail}`);
        return {
            success: true,
            publicUrl,
            liveVersion: timestamp,
            slug,
        };
    }
    catch (err) {
        const error = err;
        console.error(`setLiveVersion failed: venue=${venueId}, version=${timestamp}, error=${error.message}`);
        if (error.message.includes('permission')) {
            throw new https_1.HttpsError('permission-denied', 'Could not update live version. Please contact support.');
        }
        throw new https_1.HttpsError('internal', `Failed to set live version: ${error.message}`);
    }
}
/**
 * Set a specific version as the live version for a venue.
 *
 * This is the "rollback" mechanism - it copies the specified version
 * to the public path and updates the Firestore liveVersion pointer.
 */
exports.setLiveVersion = (0, https_1.onCall)({
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
}, async (request) => {
    // Cast to handler type - auth validation happens in requireAuth
    return setLiveVersionHandler(request);
});
//# sourceMappingURL=setLiveVersion.js.map