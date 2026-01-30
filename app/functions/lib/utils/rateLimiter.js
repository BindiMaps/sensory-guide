"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAILY_TRANSFORM_LIMIT = void 0;
exports.checkRateLimit = checkRateLimit;
exports.getCurrentUsage = getCurrentUsage;
exports.incrementUsage = incrementUsage;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
exports.DAILY_TRANSFORM_LIMIT = 20;
/**
 * Check if user has reached their daily transform limit
 * @returns Current usage count
 * @throws HttpsError if limit exceeded (unless superadmin)
 */
async function checkRateLimit(userEmail, isSuperAdmin = false) {
    const db = (0, firestore_1.getFirestore)();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const usageRef = db.collection('usage').doc(userEmail).collection('daily').doc(today);
    const usageDoc = await usageRef.get();
    const currentCount = usageDoc.exists ? usageDoc.data()?.count || 0 : 0;
    // Superadmins bypass rate limit
    if (!isSuperAdmin && currentCount >= exports.DAILY_TRANSFORM_LIMIT) {
        throw new https_1.HttpsError('resource-exhausted', `Daily limit reached. You have used ${currentCount} of ${exports.DAILY_TRANSFORM_LIMIT} transforms today. Try again tomorrow.`, { usageToday: currentCount, usageLimit: exports.DAILY_TRANSFORM_LIMIT });
    }
    return currentCount;
}
/**
 * Get current usage without throwing
 */
async function getCurrentUsage(userEmail, isSuperAdmin = false) {
    const db = (0, firestore_1.getFirestore)();
    const today = new Date().toISOString().split('T')[0];
    const usageRef = db.collection('usage').doc(userEmail).collection('daily').doc(today);
    const usageDoc = await usageRef.get();
    const usageToday = usageDoc.exists ? usageDoc.data()?.count || 0 : 0;
    return {
        usageToday,
        usageLimit: exports.DAILY_TRANSFORM_LIMIT,
        remaining: isSuperAdmin ? Infinity : Math.max(0, exports.DAILY_TRANSFORM_LIMIT - usageToday),
        isUnlimited: isSuperAdmin,
    };
}
/**
 * Increment the user's daily usage counter
 * Call this AFTER successful transform only
 */
async function incrementUsage(userEmail) {
    const db = (0, firestore_1.getFirestore)();
    const today = new Date().toISOString().split('T')[0];
    const usageRef = db.collection('usage').doc(userEmail).collection('daily').doc(today);
    await usageRef.set({
        count: firestore_1.FieldValue.increment(1),
        lastUpdated: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
}
//# sourceMappingURL=rateLimiter.js.map