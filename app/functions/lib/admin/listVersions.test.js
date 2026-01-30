"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const https_1 = require("firebase-functions/v2/https");
// Mock firebase-admin/firestore
const mockFirestoreGet = vitest_1.vi.fn();
const mockFirestoreDoc = vitest_1.vi.fn(() => ({
    get: mockFirestoreGet,
}));
const mockFirestoreCollection = vitest_1.vi.fn(() => ({
    doc: mockFirestoreDoc,
}));
vitest_1.vi.mock('firebase-admin/firestore', () => ({
    getFirestore: () => ({
        collection: mockFirestoreCollection,
    }),
}));
// Mock firebase-admin/storage
const mockGetFiles = vitest_1.vi.fn();
const mockBucket = vitest_1.vi.fn(() => ({
    getFiles: mockGetFiles,
}));
vitest_1.vi.mock('firebase-admin/storage', () => ({
    getStorage: () => ({
        bucket: mockBucket,
    }),
}));
// Mock middleware
vitest_1.vi.mock('../middleware/auth', () => ({
    requireAuth: vitest_1.vi.fn((request) => {
        if (!request.auth)
            throw new https_1.HttpsError('unauthenticated', 'Must be logged in');
        return request.auth.token.email;
    }),
    requireEditorAccess: vitest_1.vi.fn(),
}));
// Import after mocks
const listVersions_1 = require("./listVersions");
const auth_1 = require("../middleware/auth");
(0, vitest_1.describe)('listVersions', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('throws unauthenticated when not logged in', async () => {
        const request = { auth: null, data: { venueId: 'venue-123' } };
        await (0, vitest_1.expect)((0, listVersions_1.listVersionsHandler)(request)).rejects.toThrow(vitest_1.expect.objectContaining({ code: 'unauthenticated' }));
    });
    (0, vitest_1.it)('throws invalid-argument when venueId missing', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: {},
        };
        await (0, vitest_1.expect)((0, listVersions_1.listVersionsHandler)(request)).rejects.toThrow(vitest_1.expect.objectContaining({ code: 'invalid-argument' }));
    });
    (0, vitest_1.it)('checks editor access', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123' },
        };
        // No files in storage
        mockGetFiles.mockResolvedValue([[]]);
        await (0, listVersions_1.listVersionsHandler)(request);
        (0, vitest_1.expect)(auth_1.requireEditorAccess).toHaveBeenCalledWith('user@example.com', 'venue-123');
    });
    (0, vitest_1.it)('returns empty array when no versions exist', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123' },
        };
        mockGetFiles.mockResolvedValue([[]]);
        const result = await (0, listVersions_1.listVersionsHandler)(request);
        (0, vitest_1.expect)(result.versions).toEqual([]);
    });
    (0, vitest_1.it)('lists versions with metadata from Cloud Storage', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123' },
        };
        const mockFiles = [
            {
                name: 'venues/venue-123/versions/2026-01-28T10:00:00Z.json',
                metadata: {
                    size: '1024',
                    timeCreated: '2026-01-28T10:00:00.000Z',
                },
                getSignedUrl: vitest_1.vi.fn().mockResolvedValue(['https://storage.googleapis.com/signed-url-1']),
            },
            {
                name: 'venues/venue-123/versions/2026-01-29T12:00:00Z.json',
                metadata: {
                    size: '2048',
                    timeCreated: '2026-01-29T12:00:00.000Z',
                },
                getSignedUrl: vitest_1.vi.fn().mockResolvedValue(['https://storage.googleapis.com/signed-url-2']),
            },
        ];
        mockGetFiles.mockResolvedValue([mockFiles]);
        const result = await (0, listVersions_1.listVersionsHandler)(request);
        (0, vitest_1.expect)(result.versions).toHaveLength(2);
        (0, vitest_1.expect)(result.versions[0]).toEqual({
            timestamp: '2026-01-29T12:00:00Z',
            previewUrl: 'https://storage.googleapis.com/signed-url-2',
            size: 2048,
            created: '2026-01-29T12:00:00.000Z',
        });
        (0, vitest_1.expect)(result.versions[1]).toEqual({
            timestamp: '2026-01-28T10:00:00Z',
            previewUrl: 'https://storage.googleapis.com/signed-url-1',
            size: 1024,
            created: '2026-01-28T10:00:00.000Z',
        });
    });
    (0, vitest_1.it)('sorts versions by timestamp descending (newest first)', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123' },
        };
        const mockFiles = [
            {
                name: 'venues/venue-123/versions/2026-01-28T08:00:00Z.json',
                metadata: { size: '100', timeCreated: '2026-01-28T08:00:00.000Z' },
                getSignedUrl: vitest_1.vi.fn().mockResolvedValue(['url-1']),
            },
            {
                name: 'venues/venue-123/versions/2026-01-30T12:00:00Z.json',
                metadata: { size: '200', timeCreated: '2026-01-30T12:00:00.000Z' },
                getSignedUrl: vitest_1.vi.fn().mockResolvedValue(['url-2']),
            },
            {
                name: 'venues/venue-123/versions/2026-01-29T10:00:00Z.json',
                metadata: { size: '150', timeCreated: '2026-01-29T10:00:00.000Z' },
                getSignedUrl: vitest_1.vi.fn().mockResolvedValue(['url-3']),
            },
        ];
        mockGetFiles.mockResolvedValue([mockFiles]);
        const result = await (0, listVersions_1.listVersionsHandler)(request);
        (0, vitest_1.expect)(result.versions[0].timestamp).toBe('2026-01-30T12:00:00Z');
        (0, vitest_1.expect)(result.versions[1].timestamp).toBe('2026-01-29T10:00:00Z');
        (0, vitest_1.expect)(result.versions[2].timestamp).toBe('2026-01-28T08:00:00Z');
    });
    (0, vitest_1.it)('filters out non-json files', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123' },
        };
        const mockFiles = [
            {
                name: 'venues/venue-123/versions/2026-01-28T10:00:00Z.json',
                metadata: { size: '1024', timeCreated: '2026-01-28T10:00:00.000Z' },
                getSignedUrl: vitest_1.vi.fn().mockResolvedValue(['url-1']),
            },
            {
                name: 'venues/venue-123/versions/.DS_Store',
                metadata: { size: '100', timeCreated: '2026-01-28T10:00:00.000Z' },
                getSignedUrl: vitest_1.vi.fn().mockResolvedValue(['url-2']),
            },
        ];
        mockGetFiles.mockResolvedValue([mockFiles]);
        const result = await (0, listVersions_1.listVersionsHandler)(request);
        (0, vitest_1.expect)(result.versions).toHaveLength(1);
        (0, vitest_1.expect)(result.versions[0].timestamp).toBe('2026-01-28T10:00:00Z');
    });
});
//# sourceMappingURL=listVersions.test.js.map