"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformPdf = void 0;
const https_1 = require("firebase-functions/v2/https");
const storage_1 = require("firebase-admin/storage");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../utils/rateLimiter");
const gemini_1 = require("../utils/gemini");
// pdf-parse v2 uses class-based API
const pdf_parse_1 = require("pdf-parse");
/**
 * Update progress document in Firestore
 * Client listens to this for real-time updates
 */
async function updateProgress(venueId, logId, status, progress, extra) {
    const db = (0, firestore_1.getFirestore)();
    const progressRef = db.collection('venues').doc(venueId).collection('progress').doc(logId);
    const data = {
        status,
        progress,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
        ...extra,
    };
    await progressRef.set(data, { merge: true });
}
/**
 * Update LLM log record with final status
 */
async function updateLlmLog(logId, status, extra) {
    const db = (0, firestore_1.getFirestore)();
    const logRef = db.collection('llmLogs').doc(logId);
    await logRef.update({
        status,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
        ...extra,
    });
}
/**
 * Extract text from PDF file in Cloud Storage
 */
async function extractPdfText(uploadPath) {
    const bucket = (0, storage_1.getStorage)().bucket();
    const file = bucket.file(uploadPath);
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
        throw new https_1.HttpsError('not-found', `PDF file not found: ${uploadPath}`);
    }
    // Download file to buffer
    const [buffer] = await file.download();
    // Parse PDF using pdf-parse v2 class API
    let parser = null;
    try {
        parser = new pdf_parse_1.PDFParse({ data: buffer });
        const result = await parser.getText();
        return result.text;
    }
    catch (err) {
        const error = err;
        throw new https_1.HttpsError('invalid-argument', `Could not parse PDF: ${error.message}. The file may be corrupted or password-protected.`);
    }
    finally {
        if (parser)
            await parser.destroy();
    }
}
/**
 * Store guide JSON in Cloud Storage
 */
async function storeGuideJson(venueId, guide) {
    const bucket = (0, storage_1.getStorage)().bucket();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = `venues/${venueId}/versions/${timestamp}.json`;
    const file = bucket.file(outputPath);
    await file.save(JSON.stringify(guide, null, 2), {
        contentType: 'application/json',
        metadata: {
            cacheControl: 'public, max-age=31536000', // 1 year (immutable versions)
        },
    });
    return outputPath;
}
/**
 * Update venue status to draft after successful transform
 */
async function updateVenueStatus(venueId) {
    const db = (0, firestore_1.getFirestore)();
    await db.collection('venues').doc(venueId).update({
        status: 'draft',
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
}
/**
 * Main PDF transformation function
 *
 * Flow:
 * 1. Validate auth + editor access
 * 2. Check rate limit
 * 3. Extract text from PDF
 * 4. Transform via Gemini
 * 5. Validate output
 * 6. Store in Cloud Storage
 * 7. Update venue status
 * 8. Increment usage counter
 */
exports.transformPdf = (0, https_1.onCall)({
    cors: true,
    timeoutSeconds: 540, // 9 minutes max for LLM processing
    memory: '512MiB',
    secrets: ['GOOGLE_AI_API_KEY'],
}, async (request) => {
    // 1. Auth check
    const userEmail = (0, auth_1.requireAuth)(request);
    // Validate input
    const { venueId, uploadPath, logId } = request.data;
    if (!venueId || typeof venueId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'venueId is required');
    }
    if (!uploadPath || typeof uploadPath !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'uploadPath is required');
    }
    if (!logId || typeof logId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'logId is required');
    }
    // 2. Check editor access
    await (0, auth_1.requireEditorAccess)(userEmail, venueId);
    // 3. Check rate limit (don't proceed if exceeded)
    const usageToday = await (0, rateLimiter_1.checkRateLimit)(userEmail);
    // Mark LLM log as processing
    await updateLlmLog(logId, 'processing');
    // Initialize progress tracking
    await updateProgress(venueId, logId, 'uploaded', 0);
    try {
        // 4. Extract text from PDF
        await updateProgress(venueId, logId, 'extracting', 20);
        const pdfText = await extractPdfText(uploadPath);
        if (!pdfText || pdfText.trim().length < 50) {
            throw new https_1.HttpsError('invalid-argument', 'Could not extract text from PDF. The document may be scanned images without OCR.');
        }
        // 5. Get venue name for context
        const db = (0, firestore_1.getFirestore)();
        const venueDoc = await db.collection('venues').doc(venueId).get();
        const venueName = venueDoc.data()?.name || 'Unknown Venue';
        // 6. Transform via Gemini
        await updateProgress(venueId, logId, 'analysing', 40);
        let result;
        let retryCount = 0;
        try {
            result = await (0, gemini_1.transformPdfToGuide)(pdfText, venueName);
        }
        catch (err) {
            // Track retry attempts for UI feedback
            if ((0, gemini_1.isRetryableError)(err)) {
                retryCount++;
                await updateProgress(venueId, logId, 'analysing', 45, { retryCount });
            }
            throw err;
        }
        await updateProgress(venueId, logId, 'generating', 70);
        // 7. Store guide JSON
        const outputPath = await storeGuideJson(venueId, result.guide);
        // 8. Update venue status to draft
        await updateVenueStatus(venueId);
        // 9. Mark complete
        await updateProgress(venueId, logId, 'ready', 100, { outputPath });
        await updateLlmLog(logId, 'complete', {
            tokensUsed: result.tokensUsed,
            outputPath,
        });
        // 10. Increment usage counter (only on success)
        await (0, rateLimiter_1.incrementUsage)(userEmail);
        // Log for monitoring
        const modelInfo = (0, gemini_1.getModelInfo)();
        console.log(`Transform complete: venue=${venueId}, user=${userEmail}, ` +
            `tokens=${result.tokensUsed}, model=${modelInfo.name}`);
        // Extract suggestions from guide
        const suggestions = result.guide.suggestions || [];
        return {
            success: true,
            outputPath,
            tokensUsed: result.tokensUsed,
            suggestions,
            usageToday: usageToday + 1,
            usageLimit: 50,
        };
    }
    catch (err) {
        const error = err;
        // Update progress with failure
        await updateProgress(venueId, logId, 'failed', 0, {
            error: error.message,
        });
        await updateLlmLog(logId, 'failed', {
            error: error.message,
        });
        // Re-throw HttpsError as-is, wrap others
        if (err instanceof https_1.HttpsError) {
            throw err;
        }
        console.error(`Transform failed: venue=${venueId}, error=${error.message}`);
        throw new https_1.HttpsError('internal', `Transform failed: ${error.message}`);
    }
});
//# sourceMappingURL=transformPdf.js.map