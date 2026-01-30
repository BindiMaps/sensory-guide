"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishGuide = void 0;
const https_1 = require("firebase-functions/v2/https");
const storage_1 = require("firebase-admin/storage");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("../middleware/auth");
/**
 * Publish a guide to make it publicly accessible.
 *
 * Flow:
 * 1. Validate auth + editor access
 * 2. Verify outputPath exists in Cloud Storage
 * 3. Extract timestamp from outputPath
 * 4. Make file publicly readable
 * 5. Update Firestore venue doc with liveVersion and status
 * 6. Return public URL and metadata
 */
exports.publishGuide = (0, https_1.onCall)({
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
}, async (request) => {
    // 1. Auth check
    const userEmail = (0, auth_1.requireAuth)(request);
    // Validate input
    const { venueId, outputPath } = request.data;
    if (!venueId || typeof venueId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'venueId is required');
    }
    if (!outputPath || typeof outputPath !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'outputPath is required');
    }
    // 2. Check editor access
    await (0, auth_1.requireEditorAccess)(userEmail, venueId);
    // 3. Get venue data for slug
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
    // 4. Verify outputPath exists in Storage
    const storage = (0, storage_1.getStorage)();
    const bucket = storage.bucket();
    const file = bucket.file(outputPath);
    const [exists] = await file.exists();
    if (!exists) {
        throw new https_1.HttpsError('not-found', 'Guide file not found. Please re-upload the PDF and try again.');
    }
    // 5. Extract timestamp from outputPath
    // Format: venues/{venueId}/versions/{timestamp}.json
    const pathParts = outputPath.split('/');
    const filename = pathParts[pathParts.length - 1];
    const liveVersion = filename?.replace('.json', '');
    if (!liveVersion) {
        throw new https_1.HttpsError('internal', 'Could not extract version from output path');
    }
    try {
        // 6. Copy to public slug-based path (this is what public page fetches)
        const publicPath = `public/guides/${slug}.json`;
        const publicFile = bucket.file(publicPath);
        await file.copy(publicFile);
        await publicFile.makePublic();
        // 7. Also make versioned file public (for admin version history)
        await file.makePublic();
        // 8. Update Firestore venue doc
        await venueRef.update({
            liveVersion,
            status: 'published',
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 9. Construct public URL (slug-based, not versioned)
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${publicPath}`;
        console.log(`Guide published: venue=${venueId}, version=${liveVersion}, user=${userEmail}`);
        return {
            success: true,
            publicUrl,
            liveVersion,
            slug,
        };
    }
    catch (err) {
        const error = err;
        console.error(`Publish failed: venue=${venueId}, error=${error.message}`);
        // Check for specific Storage errors
        if (error.message.includes('permission')) {
            throw new https_1.HttpsError('permission-denied', 'Could not make guide public. Please contact support.');
        }
        throw new https_1.HttpsError('internal', `Failed to publish guide: ${error.message}`);
    }
});
//# sourceMappingURL=publishGuide.js.map