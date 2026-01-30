"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromAllowList = exports.addToAllowList = exports.getAllowList = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../middleware/auth");
const accessControl_1 = require("../utils/accessControl");
/**
 * Get the current allow-list (super admin only).
 */
exports.getAllowList = (0, https_1.onCall)({
    cors: true,
    timeoutSeconds: 10,
    memory: '256MiB',
}, async (request) => {
    const userEmail = (0, auth_1.requireAuth)(request);
    // Only super admins can view the allow-list
    if (!(await (0, accessControl_1.isSuperAdmin)(userEmail))) {
        throw new https_1.HttpsError('permission-denied', 'Super admin access required');
    }
    const emails = await (0, accessControl_1.getAllowedEmails)();
    return { emails };
});
/**
 * Add an email to the allow-list (super admin only).
 */
exports.addToAllowList = (0, https_1.onCall)({
    cors: true,
    timeoutSeconds: 10,
    memory: '256MiB',
}, async (request) => {
    const userEmail = (0, auth_1.requireAuth)(request);
    // Only super admins can modify the allow-list
    if (!(await (0, accessControl_1.isSuperAdmin)(userEmail))) {
        throw new https_1.HttpsError('permission-denied', 'Super admin access required');
    }
    const { email } = request.data;
    if (!email || typeof email !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'Email is required');
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid email format');
    }
    await (0, accessControl_1.addAllowedEmail)(email);
    const emails = await (0, accessControl_1.getAllowedEmails)();
    console.log(`Allow-list: added ${email} by ${userEmail}`);
    return { success: true, emails };
});
/**
 * Remove an email from the allow-list (super admin only).
 */
exports.removeFromAllowList = (0, https_1.onCall)({
    cors: true,
    timeoutSeconds: 10,
    memory: '256MiB',
}, async (request) => {
    const userEmail = (0, auth_1.requireAuth)(request);
    // Only super admins can modify the allow-list
    if (!(await (0, accessControl_1.isSuperAdmin)(userEmail))) {
        throw new https_1.HttpsError('permission-denied', 'Super admin access required');
    }
    const { email } = request.data;
    if (!email || typeof email !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'Email is required');
    }
    await (0, accessControl_1.removeAllowedEmail)(email);
    const emails = await (0, accessControl_1.getAllowedEmails)();
    console.log(`Allow-list: removed ${email} by ${userEmail}`);
    return { success: true, emails };
});
//# sourceMappingURL=manageAllowList.js.map