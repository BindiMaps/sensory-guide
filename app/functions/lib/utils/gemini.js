"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonRetryableError = exports.RetryableError = void 0;
exports.transformPdfToGuide = transformPdfToGuide;
exports.isRetryableError = isRetryableError;
exports.getModelInfo = getModelInfo;
const generative_ai_1 = require("@google/generative-ai");
const guideSchema_1 = require("../schemas/guideSchema");
// Configuration
const MODEL_NAME = 'gemini-2.5-pro'; // Best quality for structured extraction
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
// Error types for retry logic
class RetryableError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RetryableError';
    }
}
exports.RetryableError = RetryableError;
class NonRetryableError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NonRetryableError';
    }
}
exports.NonRetryableError = NonRetryableError;
// Get API key from environment
function getApiKey() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        throw new NonRetryableError('GOOGLE_AI_API_KEY not configured. Run: firebase functions:secrets:set GOOGLE_AI_API_KEY');
    }
    // Debug: confirm key is loaded (shows first 8 chars only)
    console.log(`Gemini API key loaded: ${apiKey.substring(0, 8)}...`);
    return apiKey;
}
// Initialize Gemini client
function getModel() {
    const genAI = new generative_ai_1.GoogleGenerativeAI(getApiKey());
    return genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            temperature: 0.2, // Low temperature for consistent structured output
            topP: 0.8,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json', // Request JSON output
        },
    });
}
// System prompt for ASPECT PDF parsing
const SYSTEM_PROMPT = `You are an expert accessibility auditor who transforms sensory audit documents into structured JSON for Sensory Guides.

Your task is to extract information from a PDF audit document and output valid JSON matching this exact schema:

${(0, guideSchema_1.getGuideJsonSchemaString)()}

## Instructions:

1. **Venue Information**: Extract the venue name, address, and any contact details from the document header or introduction.

2. **Journey-Based Areas**: Organise the guide by the physical journey through the venue:
   - Start with Entry/Arrival
   - Progress through main areas in logical visit order
   - Include any distinct zones or sections
   - **IMPORTANT**: For each area, write a "summary" field - one short sentence (max 15 words) with key sensory highlights

3. **Sensory Details**: For each area, extract sensory information about:
   - **Sound**: Noise levels, announcements, music, echoes
   - **Light**: Brightness, flickering, natural vs artificial
   - **Crowds**: Typical density, peak times, queuing
   - **Smell**: Strong odours, food areas, cleaning products
   - **Touch**: Textures, temperatures, vibrations
   - **Movement**: Escalators, lifts, moving walkways
   - **Temperature**: Air conditioning, drafts, outdoor exposure

4. **Sensory Levels**:
   - "low" = Generally calm, minimal sensory input
   - "medium" = Moderate activity, manageable for most
   - "high" = Potentially overwhelming, may need preparation

5. **Facilities**: Extract locations of:
   - Emergency exits
   - Bathrooms (especially accessible ones)
   - Quiet zones or low-sensory areas

6. **Suggestions**: Generate 3-5 specific, actionable suggestions for improving the guide content based on what might be missing or unclear.

## Important Rules:
- Output ONLY valid JSON, no markdown code blocks
- Use Australian English spelling (e.g., "colour" not "color")
- Be specific and practical in descriptions
- If information is not in the document, omit that field rather than guessing
- The "badges" array for each area should list categories that have warnings in that area
- Set generatedAt to the current ISO timestamp

Now process the following document content:`;
// Transform PDF text to Guide JSON
async function transformPdfToGuide(pdfText, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_venueName // Reserved for future context injection
) {
    if (!pdfText || pdfText.trim().length < 100) {
        throw new NonRetryableError('Could not extract sufficient text from PDF. The document may be scanned images without OCR text.');
    }
    const model = getModel();
    let lastError = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent([
                SYSTEM_PROMPT,
                `\n\nDocument content:\n\n${pdfText}`,
            ]);
            const response = result.response;
            const text = response.text();
            // Parse JSON response
            let parsed;
            try {
                // Clean up response - remove markdown code blocks if present
                let cleanedText = text
                    .replace(/^```json\s*/i, '')
                    .replace(/^```\s*/i, '')
                    .replace(/\s*```$/i, '')
                    .trim();
                // Try to extract JSON object if there's extra text
                const jsonStart = cleanedText.indexOf('{');
                const jsonEnd = cleanedText.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                    cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
                }
                // Repair common JSON issues from LLMs
                cleanedText = cleanedText
                    // Remove trailing commas before ] or }
                    .replace(/,(\s*[\]}])/g, '$1')
                    // Fix missing commas between array elements (string followed by string/object)
                    .replace(/"\s*\n\s*"/g, '",\n"')
                    .replace(/"\s*\n\s*\{/g, '",\n{')
                    .replace(/\}\s*\n\s*\{/g, '},\n{');
                parsed = JSON.parse(cleanedText);
            }
            catch (parseErr) {
                const parseError = parseErr;
                console.error('JSON parse error:', parseError.message);
                console.error('Raw response (first 500 chars):', text.substring(0, 500));
                throw new RetryableError(`LLM returned invalid JSON: ${parseError.message}`);
            }
            // Validate against schema
            const validation = (0, guideSchema_1.validateGuide)(parsed);
            if (!validation.valid) {
                throw new RetryableError(`LLM output failed validation: ${validation.errors.join(', ')}`);
            }
            // Calculate tokens used
            const tokensUsed = response.usageMetadata?.totalTokenCount ?? 0;
            return {
                guide: validation.data,
                tokensUsed,
            };
        }
        catch (err) {
            lastError = err;
            // Don't retry non-retryable errors
            if (err instanceof NonRetryableError) {
                throw err;
            }
            // Check for rate limiting or server errors (retryable)
            if (err instanceof Error) {
                const message = err.message.toLowerCase();
                if (message.includes('rate limit') ||
                    message.includes('quota') ||
                    message.includes('503') ||
                    message.includes('timeout')) {
                    lastError = new RetryableError(err.message);
                }
            }
            // If we have retries left, wait and try again
            if (attempt < MAX_RETRIES) {
                const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }
        }
    }
    // All retries exhausted
    throw lastError || new Error('Transform failed after all retries');
}
// Check if error is retryable (for UI feedback)
function isRetryableError(error) {
    return error instanceof RetryableError;
}
// Get model info for logging
function getModelInfo() {
    return {
        name: MODEL_NAME,
        description: 'Gemini 2.5 Pro - Best quality for structured extraction',
    };
}
//# sourceMappingURL=gemini.js.map