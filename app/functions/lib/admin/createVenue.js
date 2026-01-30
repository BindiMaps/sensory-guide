"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVenue = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("../middleware/auth");
const accessControl_1 = require("../utils/accessControl");
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
/**
 * Create a new venue with allow-list protection.
 *
 * Only users on the allow-list (or super admins) can create venues.
 * This protects LLM API budget from abuse.
 */
exports.createVenue = (0, https_1.onCall)({
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
}, async (request) => {
    // 1. Auth check
    const userEmail = (0, auth_1.requireAuth)(request);
    // 2. Allow-list check (AC5: server-side protection)
    const approved = await (0, accessControl_1.isApprovedUser)(userEmail);
    if (!approved) {
        throw new https_1.HttpsError('permission-denied', 'Account not yet approved for venue creation');
    }
    // 3. Validate input
    const { name, slug: requestedSlug } = request.data;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'Venue name is required');
    }
    const trimmedName = name.trim();
    if (trimmedName.length > 100) {
        throw new https_1.HttpsError('invalid-argument', 'Venue name is too long (max 100 characters)');
    }
    // Slugify and validate
    const slug = slugify(requestedSlug || trimmedName);
    if (!slug || slug.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'Could not generate a valid URL slug');
    }
    if (slug.length > 100) {
        throw new https_1.HttpsError('invalid-argument', 'URL slug is too long');
    }
    // 4. Check slug uniqueness
    const db = (0, firestore_1.getFirestore)();
    const existingQuery = await db
        .collection('venues')
        .where('slug', '==', slug)
        .limit(1)
        .get();
    if (!existingQuery.empty) {
        throw new https_1.HttpsError('already-exists', 'This URL slug is already taken');
    }
    // 5. Create the venue
    const venueData = {
        name: trimmedName,
        slug,
        status: 'draft',
        editors: [userEmail],
        createdBy: userEmail,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('venues').add(venueData);
    console.log(`Venue created: id=${docRef.id}, slug=${slug}, user=${userEmail}`);
    return {
        success: true,
        venueId: docRef.id,
        slug,
    };
});
//# sourceMappingURL=createVenue.js.map