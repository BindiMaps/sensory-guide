#!/usr/bin/env npx ts-node
/**
 * Test script for PDF transformation pipeline
 *
 * Usage:
 *   export GOOGLE_AI_API_KEY="your-key"
 *   npx ts-node scripts/test-transform.ts [path-to-pdf]
 *
 * Default test file: ../docs/ExampleMappingNotes.pdf
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { PDFParse } from 'pdf-parse'
import { GoogleGenerativeAI } from '@google/generative-ai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const MODEL_NAME = 'gemini-2.5-flash'

// Simplified schema string for the prompt
const SCHEMA_STRING = `{
  "schemaVersion": "1.0",
  "venue": {
    "name": "string",
    "address": "string",
    "contact": "string (optional)",
    "summary": "string",
    "lastUpdated": "ISO date string"
  },
  "categories": ["Sound", "Light", "Crowds", ...],
  "areas": [
    {
      "id": "string",
      "name": "string",
      "order": number,
      "badges": ["Sound", ...],
      "details": [
        {
          "category": "Sound|Light|Crowds|Smell|Touch|Movement|Temperature|Other",
          "level": "low|medium|high",
          "description": "string"
        }
      ]
    }
  ],
  "facilities": {
    "exits": [{ "description": "string" }],
    "bathrooms": [{ "description": "string" }],
    "quietZones": [{ "description": "string" }]
  },
  "suggestions": ["string", ...],
  "generatedAt": "ISO date string"
}`

const SYSTEM_PROMPT = `You are an expert accessibility auditor who transforms sensory audit documents into structured JSON for Sensory Guides.

Your task is to extract information from a PDF audit document and output valid JSON matching this exact schema:

${SCHEMA_STRING}

## Instructions:

1. **Venue Information**: Extract the venue name, address, and any contact details.

2. **Journey-Based Areas**: Organise the guide by the physical journey through the venue:
   - Start with Entry/Arrival
   - Progress through main areas in logical visit order

3. **Sensory Details**: For each area, extract sensory information about:
   - **Sound**: Noise levels, announcements, music, echoes
   - **Light**: Brightness, flickering, natural vs artificial
   - **Crowds**: Typical density, peak times, queuing
   - **Smell**: Strong odours, food areas
   - **Touch**: Textures, temperatures
   - **Movement**: Escalators, lifts
   - **Temperature**: Air conditioning, drafts

4. **Sensory Levels**:
   - "low" = Generally calm
   - "medium" = Moderate activity
   - "high" = Potentially overwhelming

5. **Suggestions**: Generate 3-5 suggestions for improving the guide.

## Important:
- Output ONLY valid JSON, no markdown code blocks
- Use Australian English spelling
- If information is not in the document, omit that field

Now process the following document content:`

async function main() {
  // Check for API key
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    console.error('❌ GOOGLE_AI_API_KEY not set')
    console.error('   Run: export GOOGLE_AI_API_KEY="your-key"')
    process.exit(1)
  }
  console.log(`✅ API key loaded: ${apiKey.substring(0, 8)}...`)

  // Get PDF path
  const pdfPath = process.argv[2] || path.join(__dirname, '../../docs/ExampleMappingNotes.pdf')
  const absolutePath = path.resolve(pdfPath)

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ PDF not found: ${absolutePath}`)
    process.exit(1)
  }
  console.log(`✅ PDF found: ${absolutePath}`)

  // Extract text from PDF
  console.log('\n📄 Extracting text from PDF...')
  const pdfBuffer = fs.readFileSync(absolutePath)

  let pdfText: string
  let parser: PDFParse | null = null
  try {
    parser = new PDFParse({ data: pdfBuffer })
    const result = await parser.getText()
    pdfText = result.text
    console.log(`✅ Extracted ${pdfText.length} characters`)
    console.log(`   First 200 chars: ${pdfText.substring(0, 200).replace(/\n/g, ' ')}...`)
  } catch (err) {
    console.error('❌ Failed to parse PDF:', err)
    process.exit(1)
  } finally {
    if (parser) await parser.destroy()
  }

  if (pdfText.length < 100) {
    console.error('❌ PDF has insufficient text (may be scanned images)')
    process.exit(1)
  }

  // Call Gemini
  console.log('\n🤖 Calling Gemini API...')
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  })

  try {
    const startTime = Date.now()
    const result = await model.generateContent([
      SYSTEM_PROMPT,
      `\n\nDocument content:\n\n${pdfText}`,
    ])

    const response = result.response
    const text = response.text()
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    const tokens = response.usageMetadata?.totalTokenCount ?? 'unknown'

    console.log(`✅ Response received in ${elapsed}s (${tokens} tokens)`)

    // Parse JSON
    const cleanedText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleanedText)
      console.log('\n✅ Valid JSON returned')
    } catch {
      console.error('\n❌ Invalid JSON returned:')
      console.error(text.substring(0, 500))
      process.exit(1)
    }

    // Output result
    console.log('\n📋 Generated Guide:')
    console.log('━'.repeat(50))
    console.log(JSON.stringify(parsed, null, 2))
    console.log('━'.repeat(50))

    // Summary
    const guide = parsed as Record<string, unknown>
    const areas = (guide.areas as Array<unknown>) || []
    const suggestions = (guide.suggestions as Array<unknown>) || []

    console.log('\n📊 Summary:')
    console.log(`   Venue: ${(guide.venue as Record<string, unknown>)?.name || 'Unknown'}`)
    console.log(`   Areas: ${areas.length}`)
    console.log(`   Suggestions: ${suggestions.length}`)

    // Save output
    const outputPath = absolutePath.replace('.pdf', '-guide.json')
    fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2))
    console.log(`\n💾 Saved to: ${outputPath}`)

  } catch (err) {
    console.error('\n❌ Gemini API error:', err)
    process.exit(1)
  }
}

main()
