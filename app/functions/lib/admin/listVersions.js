"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listVersions = void 0;
exports.listVersionsHandler = listVersionsHandler;
const https_1 = require("firebase-functions/v2/https");
const storage_1 = require("firebase-admin/storage");
const auth_1 = require("../middleware/auth");
/**
 * Internal handler for testing - contains the actual logic.
 */
async function listVersionsHandler(request) {
    // 1. Auth check
    const userEmail = (0, auth_1.requireAuth)(request);
    // 2. Validate input
    const { venueId } = request.data;
    if (!venueId || typeof venueId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'venueId is required');
    }
    // 3. Check editor access
    await (0, auth_1.requireEditorAccess)(userEmail, venueId);
    // 4. List files from Cloud Storage
    const storage = (0, storage_1.getStorage)();
    const bucket = storage.bucket();
    const prefix = `venues/${venueId}/versions/`;
    const [files] = await bucket.getFiles({ prefix });
    // 5. Filter to .json files only and extract metadata
    const jsonFiles = files.filter((file) => file.name.endsWith('.json'));
    const versions = await Promise.all(jsonFiles.map(async (file) => {
        // Extract timestamp from filename: venues/{venueId}/versions/{timestamp}.json
        const filename = file.name.split('/').pop() ?? '';
        const timestamp = filename.replace('.json', '');
        // Get signed URL for preview (valid for 1 hour)
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });
        return {
            timestamp,
            previewUrl: signedUrl,
            size: parseInt(file.metadata.size, 10) || 0,
            created: file.metadata.timeCreated,
        };
    }));
    // 6. Sort by timestamp descending (newest first)
    versions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return { versions };
}
/**
 * List all versions for a venue.
 *
 * Returns array of versions with:
 * - timestamp: Version identifier (ISO timestamp)
 * - previewUrl: Signed URL for preview (valid 1hr)
 * - size: File size in bytes
 * - created: Creation timestamp
 */
exports.listVersions = (0, https_1.onCall)({
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
}, async (request) => {
    // Cast to handler type - auth validation happens in requireAuth
    return listVersionsHandler(request);
});
//# sourceMappingURL=listVersions.js.map