"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Mock firebase-admin/firestore
const mockGet = vitest_1.vi.fn();
const mockSet = vitest_1.vi.fn();
const mockUpdate = vitest_1.vi.fn();
const mockDoc = vitest_1.vi.fn(() => ({
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
}));
const mockCollection = vitest_1.vi.fn(() => ({
    doc: mockDoc,
}));
vitest_1.vi.mock('firebase-admin/firestore', () => ({
    getFirestore: () => ({
        collection: mockCollection,
    }),
}));
// Import after mock
const accessControl_1 = require("./accessControl");
(0, vitest_1.describe)('accessControl', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('isSuperAdmin', () => {
        (0, vitest_1.it)('returns true when email is in superAdmins list', async () => {
            mockGet.mockResolvedValue({
                exists: true,
                data: () => ({ emails: ['admin@example.com', 'super@example.com'] }),
            });
            const result = await (0, accessControl_1.isSuperAdmin)('admin@example.com');
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(mockCollection).toHaveBeenCalledWith('config');
            (0, vitest_1.expect)(mockDoc).toHaveBeenCalledWith('superAdmins');
        });
        (0, vitest_1.it)('returns true for case-insensitive match', async () => {
            mockGet.mockResolvedValue({
                exists: true,
                data: () => ({ emails: ['Admin@Example.com'] }),
            });
            const result = await (0, accessControl_1.isSuperAdmin)('admin@example.com');
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('returns false when email is not in list', async () => {
            mockGet.mockResolvedValue({
                exists: true,
                data: () => ({ emails: ['other@example.com'] }),
            });
            const result = await (0, accessControl_1.isSuperAdmin)('admin@example.com');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('returns false when superAdmins doc does not exist', async () => {
            mockGet.mockResolvedValue({
                exists: false,
            });
            const result = await (0, accessControl_1.isSuperAdmin)('admin@example.com');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('returns false when emails array is missing', async () => {
            mockGet.mockResolvedValue({
                exists: true,
                data: () => ({}),
            });
            const result = await (0, accessControl_1.isSuperAdmin)('admin@example.com');
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
    (0, vitest_1.describe)('isApprovedUser', () => {
        (0, vitest_1.it)('returns true for super admin even if not in allow-list', async () => {
            // First call: superAdmins check
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ emails: ['admin@example.com'] }),
            });
            const result = await (0, accessControl_1.isApprovedUser)('admin@example.com');
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('returns true for email in allow-list', async () => {
            // First call: superAdmins check (not a super admin)
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ emails: ['other@example.com'] }),
            });
            // Second call: access check
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ allowedEmails: ['user@example.com'] }),
            });
            const result = await (0, accessControl_1.isApprovedUser)('user@example.com');
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('returns false when not in allow-list and not super admin', async () => {
            // First call: superAdmins check
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ emails: ['other@example.com'] }),
            });
            // Second call: access check
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ allowedEmails: ['different@example.com'] }),
            });
            const result = await (0, accessControl_1.isApprovedUser)('user@example.com');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('returns false when access doc does not exist (fail secure)', async () => {
            // First call: superAdmins check
            mockGet.mockResolvedValueOnce({
                exists: false,
            });
            // Second call: access check
            mockGet.mockResolvedValueOnce({
                exists: false,
            });
            const result = await (0, accessControl_1.isApprovedUser)('user@example.com');
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
    (0, vitest_1.describe)('getAllowedEmails', () => {
        (0, vitest_1.it)('returns empty array when access doc does not exist', async () => {
            mockGet.mockResolvedValue({
                exists: false,
            });
            const result = await (0, accessControl_1.getAllowedEmails)();
            (0, vitest_1.expect)(result).toEqual([]);
        });
        (0, vitest_1.it)('returns emails array when exists', async () => {
            mockGet.mockResolvedValue({
                exists: true,
                data: () => ({ allowedEmails: ['a@example.com', 'b@example.com'] }),
            });
            const result = await (0, accessControl_1.getAllowedEmails)();
            (0, vitest_1.expect)(result).toEqual(['a@example.com', 'b@example.com']);
        });
    });
    (0, vitest_1.describe)('addAllowedEmail', () => {
        (0, vitest_1.it)('creates access doc if it does not exist', async () => {
            mockGet.mockResolvedValue({
                exists: false,
            });
            await (0, accessControl_1.addAllowedEmail)('new@example.com');
            (0, vitest_1.expect)(mockSet).toHaveBeenCalledWith({ allowedEmails: ['new@example.com'] });
        });
        (0, vitest_1.it)('appends email to existing list', async () => {
            mockGet.mockResolvedValue({
                exists: true,
                data: () => ({ allowedEmails: ['existing@example.com'] }),
            });
            await (0, accessControl_1.addAllowedEmail)('new@example.com');
            (0, vitest_1.expect)(mockUpdate).toHaveBeenCalledWith({
                allowedEmails: ['existing@example.com', 'new@example.com'],
            });
        });
        (0, vitest_1.it)('normalizes email to lowercase', async () => {
            mockGet.mockResolvedValue({
                exists: false,
            });
            await (0, accessControl_1.addAllowedEmail)('NEW@EXAMPLE.COM');
            (0, vitest_1.expect)(mockSet).toHaveBeenCalledWith({ allowedEmails: ['new@example.com'] });
        });
        (0, vitest_1.it)('does not add duplicate email', async () => {
            mockGet.mockResolvedValue({
                exists: true,
                data: () => ({ allowedEmails: ['existing@example.com'] }),
            });
            await (0, accessControl_1.addAllowedEmail)('EXISTING@example.com');
            (0, vitest_1.expect)(mockUpdate).not.toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('removeAllowedEmail', () => {
        (0, vitest_1.it)('does nothing if access doc does not exist', async () => {
            mockGet.mockResolvedValue({
                exists: false,
            });
            await (0, accessControl_1.removeAllowedEmail)('any@example.com');
            (0, vitest_1.expect)(mockUpdate).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('removes email from list (case-insensitive)', async () => {
            mockGet.mockResolvedValue({
                exists: true,
                data: () => ({ allowedEmails: ['a@example.com', 'B@Example.Com', 'c@example.com'] }),
            });
            await (0, accessControl_1.removeAllowedEmail)('b@example.com');
            (0, vitest_1.expect)(mockUpdate).toHaveBeenCalledWith({
                allowedEmails: ['a@example.com', 'c@example.com'],
            });
        });
    });
});
//# sourceMappingURL=accessControl.test.js.map