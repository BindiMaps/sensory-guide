"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = void 0;
exports.isSuperAdminSync = isSuperAdminSync;
exports.requireAuth = requireAuth;
exports.requireEditorAccess = requireEditorAccess;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const accessControl_1 = require("../utils/accessControl");
Object.defineProperty(exports, "isSuperAdmin", { enumerable: true, get: function () { return accessControl_1.isSuperAdmin; } });
// Legacy sync check (for backwards compatibility in requireEditorAccess)
// This is a fallback - prefer the async isSuperAdmin from accessControl
const SUPER_ADMIN_EMAILS_FALLBACK = ['keith@bindimaps.com'];
function isSuperAdminSync(email) {
    return email !== undefined && SUPER_ADMIN_EMAILS_FALLBACK.includes(email);
}
function requireAuth(request) {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be logged in');
    }
    const email = request.auth.token.email;
    if (!email) {
        throw new https_1.HttpsError('unauthenticated', 'No email associated with account');
    }
    return email;
}
async function requireEditorAccess(userEmail, venueId) {
    const db = (0, firestore_1.getFirestore)();
    const venueDoc = await db.collection('venues').doc(venueId).get();
    if (!venueDoc.exists) {
        throw new https_1.HttpsError('not-found', `Venue not found: ${venueId}`);
    }
    const venueData = venueDoc.data();
    const editors = venueData?.editors;
    if (!editors) {
        throw new https_1.HttpsError('internal', 'Venue has no editors array');
    }
    const normalizedEditors = editors.map((e) => e.toLowerCase());
    const normalizedEmail = userEmail.toLowerCase();
    if (!normalizedEditors.includes(normalizedEmail) && !isSuperAdminSync(userEmail)) {
        throw new https_1.HttpsError('permission-denied', 'Not an editor of this venue');
    }
}
//# sourceMappingURL=auth.js.map