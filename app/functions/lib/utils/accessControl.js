"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = isSuperAdmin;
exports.isApprovedUser = isApprovedUser;
exports.getAllowedEmails = getAllowedEmails;
exports.addAllowedEmail = addAllowedEmail;
exports.removeAllowedEmail = removeAllowedEmail;
const firestore_1 = require("firebase-admin/firestore");
/**
 * Check if an email is in the super admin list.
 * Super admins bypass all access restrictions.
 */
async function isSuperAdmin(email) {
    const db = (0, firestore_1.getFirestore)();
    const superAdminsDoc = await db.collection('config').doc('superAdmins').get();
    if (!superAdminsDoc.exists) {
        return false;
    }
    const emails = superAdminsDoc.data()?.emails;
    if (!emails || !Array.isArray(emails)) {
        return false;
    }
    return emails.map((e) => e.toLowerCase()).includes(email.toLowerCase());
}
/**
 * Check if an email is approved for venue creation.
 * Returns true if:
 * - User is a super admin, OR
 * - User's email is in the allow-list
 */
async function isApprovedUser(email) {
    // Super admins always approved
    if (await isSuperAdmin(email)) {
        return true;
    }
    const db = (0, firestore_1.getFirestore)();
    const accessDoc = await db.collection('config').doc('access').get();
    if (!accessDoc.exists) {
        // If no access doc exists, deny by default (fail secure)
        return false;
    }
    const allowedEmails = accessDoc.data()?.allowedEmails;
    if (!allowedEmails || !Array.isArray(allowedEmails)) {
        return false;
    }
    return allowedEmails.map((e) => e.toLowerCase()).includes(email.toLowerCase());
}
/**
 * Get the list of allowed emails (for super admin UI).
 */
async function getAllowedEmails() {
    const db = (0, firestore_1.getFirestore)();
    const accessDoc = await db.collection('config').doc('access').get();
    if (!accessDoc.exists) {
        return [];
    }
    const emails = accessDoc.data()?.allowedEmails;
    return emails || [];
}
/**
 * Add an email to the allow-list.
 */
async function addAllowedEmail(email) {
    const db = (0, firestore_1.getFirestore)();
    const accessRef = db.collection('config').doc('access');
    const accessDoc = await accessRef.get();
    const normalizedEmail = email.toLowerCase().trim();
    if (!accessDoc.exists) {
        await accessRef.set({ allowedEmails: [normalizedEmail] });
    }
    else {
        const current = accessDoc.data()?.allowedEmails || [];
        if (!current.map((e) => e.toLowerCase()).includes(normalizedEmail)) {
            await accessRef.update({ allowedEmails: [...current, normalizedEmail] });
        }
    }
}
/**
 * Remove an email from the allow-list.
 */
async function removeAllowedEmail(email) {
    const db = (0, firestore_1.getFirestore)();
    const accessRef = db.collection('config').doc('access');
    const accessDoc = await accessRef.get();
    if (!accessDoc.exists) {
        return;
    }
    const current = accessDoc.data()?.allowedEmails || [];
    const normalizedEmail = email.toLowerCase().trim();
    const updated = current.filter((e) => e.toLowerCase() !== normalizedEmail);
    await accessRef.update({ allowedEmails: updated });
}
//# sourceMappingURL=accessControl.js.map