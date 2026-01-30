"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignedUploadUrl = void 0;
const https_1 = require("firebase-functions/v2/https");
const storage_1 = require("firebase-admin/storage");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("../middleware/auth");
const accessControl_1 = require("../utils/accessControl");
const SIGNED_URL_EXPIRY_MINUTES = 15;
const DAILY_TRANSFORM_LIMIT = 20;
async function checkRateLimit(userEmail, isAdmin = false) {
    const db = (0, firestore_1.getFirestore)();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const usageRef = db.collection('usage').doc(userEmail).collection('daily').doc(today);
    const usageDoc = await usageRef.get();
    const currentCount = usageDoc.exists ? usageDoc.data()?.count || 0 : 0;
    // Superadmins bypass rate limit
    if (!isAdmin && currentCount >= DAILY_TRANSFORM_LIMIT) {
        throw new https_1.HttpsError('resource-exhausted', `Daily limit reached. You have used ${currentCount} of ${DAILY_TRANSFORM_LIMIT} transforms today. Try again tomorrow.`, { usageToday: currentCount, usageLimit: DAILY_TRANSFORM_LIMIT });
    }
    return currentCount;
}
async function incrementUsage(userEmail) {
    const db = (0, firestore_1.getFirestore)();
    const today = new Date().toISOString().split('T')[0];
    const usageRef = db.collection('usage').doc(userEmail).collection('daily').doc(today);
    await usageRef.set({
        count: firestore_1.FieldValue.increment(1),
        lastUpdated: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
}
async function createLlmLogRecord(userEmail, venueId, uploadPath) {
    const db = (0, firestore_1.getFirestore)();
    const logRef = await db.collection('llmLogs').add({
        userEmail,
        venueId,
        uploadPath,
        status: 'pending',
        tokensUsed: null,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return logRef.id;
}
exports.getSignedUploadUrl = (0, https_1.onCall)({ cors: true }, async (request) => {
    // Auth check
    const userEmail = (0, auth_1.requireAuth)(request);
    // Validate input
    const { venueId } = request.data;
    if (!venueId || typeof venueId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'venueId is required');
    }
    // Check editor access
    await (0, auth_1.requireEditorAccess)(userEmail, venueId);
    // Check superadmin status
    const isAdmin = await (0, accessControl_1.isSuperAdmin)(userEmail);
    // Check rate limit (superadmins bypass)
    const usageToday = await checkRateLimit(userEmail, isAdmin);
    // Generate unique file path
    const timestamp = Date.now();
    const destinationPath = `venues/${venueId}/uploads/${timestamp}.pdf`;
    // Create LLM log record first (so we have the logId)
    const logId = await createLlmLogRecord(userEmail, venueId, destinationPath);
    // Get signed URL for upload
    const bucket = (0, storage_1.getStorage)().bucket();
    const file = bucket.file(destinationPath);
    let signedUrl;
    try {
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + SIGNED_URL_EXPIRY_MINUTES * 60 * 1000,
            contentType: 'application/pdf',
        });
        signedUrl = url;
    }
    catch (err) {
        const error = err;
        if (error.name === 'SigningError' || error.message?.includes('client_email')) {
            throw new https_1.HttpsError('failed-precondition', 'Local dev setup required: Run "gcloud auth application-default login" to enable signed URL generation. See README.md for details.');
        }
        throw err;
    }
    // Increment usage counter
    await incrementUsage(userEmail);
    return {
        uploadUrl: signedUrl,
        destinationPath,
        logId,
        usageToday: usageToday + 1,
        usageLimit: DAILY_TRANSFORM_LIMIT,
        isUnlimited: isAdmin,
    };
});
//# sourceMappingURL=getSignedUploadUrl.js.map