"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const https_1 = require("firebase-functions/v2/https");
// Mock firebase-admin/firestore
const mockFirestoreGet = vitest_1.vi.fn();
const mockFirestoreUpdate = vitest_1.vi.fn();
const mockFirestoreDoc = vitest_1.vi.fn(() => ({
    get: mockFirestoreGet,
    update: mockFirestoreUpdate,
}));
const mockFirestoreCollection = vitest_1.vi.fn(() => ({
    doc: mockFirestoreDoc,
}));
vitest_1.vi.mock('firebase-admin/firestore', () => ({
    getFirestore: () => ({
        collection: mockFirestoreCollection,
    }),
    FieldValue: {
        serverTimestamp: () => 'SERVER_TIMESTAMP',
    },
}));
// Mock firebase-admin/storage
const mockFileExists = vitest_1.vi.fn();
const mockFileCopy = vitest_1.vi.fn();
const mockFileMakePublic = vitest_1.vi.fn();
const mockFile = vitest_1.vi.fn(() => ({
    exists: mockFileExists,
    copy: mockFileCopy,
    makePublic: mockFileMakePublic,
}));
const mockBucket = vitest_1.vi.fn(() => ({
    file: mockFile,
    name: 'test-bucket',
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
const setLiveVersion_1 = require("./setLiveVersion");
const auth_1 = require("../middleware/auth");
(0, vitest_1.describe)('setLiveVersion', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('throws unauthenticated when not logged in', async () => {
        const request = { auth: null, data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' } };
        await (0, vitest_1.expect)((0, setLiveVersion_1.setLiveVersionHandler)(request)).rejects.toThrow(vitest_1.expect.objectContaining({ code: 'unauthenticated' }));
    });
    (0, vitest_1.it)('throws invalid-argument when venueId missing', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { timestamp: '2026-01-28T10:00:00Z' },
        };
        await (0, vitest_1.expect)((0, setLiveVersion_1.setLiveVersionHandler)(request)).rejects.toThrow(vitest_1.expect.objectContaining({ code: 'invalid-argument' }));
    });
    (0, vitest_1.it)('throws invalid-argument when timestamp missing', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123' },
        };
        await (0, vitest_1.expect)((0, setLiveVersion_1.setLiveVersionHandler)(request)).rejects.toThrow(vitest_1.expect.objectContaining({ code: 'invalid-argument' }));
    });
    (0, vitest_1.it)('checks editor access', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
        };
        // Venue exists
        mockFirestoreGet.mockResolvedValue({
            exists: true,
            data: () => ({ slug: 'test-venue' }),
        });
        // Version exists
        mockFileExists.mockResolvedValue([true]);
        mockFileCopy.mockResolvedValue([{}]);
        mockFileMakePublic.mockResolvedValue([{}]);
        mockFirestoreUpdate.mockResolvedValue({});
        await (0, setLiveVersion_1.setLiveVersionHandler)(request);
        (0, vitest_1.expect)(auth_1.requireEditorAccess).toHaveBeenCalledWith('user@example.com', 'venue-123');
    });
    (0, vitest_1.it)('throws not-found when venue does not exist', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
        };
        mockFirestoreGet.mockResolvedValue({ exists: false });
        await (0, vitest_1.expect)((0, setLiveVersion_1.setLiveVersionHandler)(request)).rejects.toThrow(vitest_1.expect.objectContaining({ code: 'not-found' }));
    });
    (0, vitest_1.it)('throws not-found when version file does not exist', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
        };
        mockFirestoreGet.mockResolvedValue({
            exists: true,
            data: () => ({ slug: 'test-venue' }),
        });
        mockFileExists.mockResolvedValue([false]);
        await (0, vitest_1.expect)((0, setLiveVersion_1.setLiveVersionHandler)(request)).rejects.toThrow(vitest_1.expect.objectContaining({ code: 'not-found' }));
    });
    (0, vitest_1.it)('copies version to public slug path and makes it public', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
        };
        mockFirestoreGet.mockResolvedValue({
            exists: true,
            data: () => ({ slug: 'my-venue' }),
        });
        mockFileExists.mockResolvedValue([true]);
        const mockPublicFile = {
            makePublic: mockFileMakePublic,
        };
        mockFileCopy.mockResolvedValue([mockPublicFile]);
        mockFileMakePublic.mockResolvedValue([{}]);
        mockFirestoreUpdate.mockResolvedValue({});
        await (0, setLiveVersion_1.setLiveVersionHandler)(request);
        // Check that file was requested for the versioned path
        (0, vitest_1.expect)(mockFile).toHaveBeenCalledWith('venues/venue-123/versions/2026-01-28T10:00:00Z.json');
        // Check that copy was called with public path
        (0, vitest_1.expect)(mockFileCopy).toHaveBeenCalled();
    });
    (0, vitest_1.it)('updates Firestore liveVersion pointer', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
        };
        mockFirestoreGet.mockResolvedValue({
            exists: true,
            data: () => ({ slug: 'test-venue' }),
        });
        mockFileExists.mockResolvedValue([true]);
        const mockPublicFile = { makePublic: mockFileMakePublic };
        mockFileCopy.mockResolvedValue([mockPublicFile]);
        mockFileMakePublic.mockResolvedValue([{}]);
        mockFirestoreUpdate.mockResolvedValue({});
        await (0, setLiveVersion_1.setLiveVersionHandler)(request);
        (0, vitest_1.expect)(mockFirestoreUpdate).toHaveBeenCalledWith({
            liveVersion: '2026-01-28T10:00:00Z',
            status: 'published',
            updatedAt: 'SERVER_TIMESTAMP',
        });
    });
    (0, vitest_1.it)('returns success response with publicUrl and liveVersion', async () => {
        const request = {
            auth: { token: { email: 'user@example.com' } },
            data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
        };
        mockFirestoreGet.mockResolvedValue({
            exists: true,
            data: () => ({ slug: 'my-venue' }),
        });
        mockFileExists.mockResolvedValue([true]);
        const mockPublicFile = { makePublic: mockFileMakePublic };
        mockFileCopy.mockResolvedValue([mockPublicFile]);
        mockFileMakePublic.mockResolvedValue([{}]);
        mockFirestoreUpdate.mockResolvedValue({});
        const result = await (0, setLiveVersion_1.setLiveVersionHandler)(request);
        (0, vitest_1.expect)(result).toEqual({
            success: true,
            publicUrl: 'https://storage.googleapis.com/test-bucket/public/guides/my-venue.json',
            liveVersion: '2026-01-28T10:00:00Z',
            slug: 'my-venue',
        });
    });
});
//# sourceMappingURL=setLiveVersion.test.js.map