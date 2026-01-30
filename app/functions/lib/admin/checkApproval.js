"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkApproval = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("../middleware/auth");
const accessControl_1 = require("../utils/accessControl");
/**
 * Check if the current user is approved for venue creation.
 * Used by the client to show/hide the "Create Venue" button.
 *
 * Note: This is for UX only - actual protection is in createVenue function.
 */
exports.checkApproval = (0, https_1.onCall)({
    cors: true,
    timeoutSeconds: 10,
    memory: '256MiB',
}, async (request) => {
    const userEmail = (0, auth_1.requireAuth)(request);
    // Check if config exists
    const db = (0, firestore_1.getFirestore)();
    const superAdminsDoc = await db.collection('config').doc('superAdmins').get();
    const needsSetup = !superAdminsDoc.exists;
    const superAdmin = await (0, accessControl_1.isSuperAdmin)(userEmail);
    const approved = await (0, accessControl_1.isApprovedUser)(userEmail);
    return {
        approved,
        isSuperAdmin: superAdmin,
        needsSetup,
    };
});
//# sourceMappingURL=checkApproval.js.map