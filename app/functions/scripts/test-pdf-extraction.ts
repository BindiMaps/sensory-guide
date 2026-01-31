#!/usr/bin/env npx ts-node
/**
 * Test script for PDF image extraction with EXPECTED output validation
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { extractPdfContent } from '../src/utils/extractPdfContent'
import { mapImagesByPageText } from '../src/utils/imageMapping'

// ACTUAL section titles from Gemini output
const SECTION_TITLES = [
  'Entry/Exit Festival Drive',
  'Walkway from newer entrance to main concourse',
  'North Entrance',
  'Northside concourse',
  'Info centre',
  'The Guardsman',
  'Main concourse',
  'Toilet area',
  'Turnstiles',
  'Paid Main concourse',
  'Platforms',
  'South side entrance (from arcade)',
]

// EXPECTED image counts per section (from user's actual PDF)
const EXPECTED: Record<string, number> = {
  'Entry/Exit Festival Drive': 1,
  'Walkway from newer entrance to main concourse': 1,
  'North Entrance': 1,
  'Northside concourse': 0,
  'Info centre': 1,
  'The Guardsman': 0,
  'Main concourse': 1,
  'Toilet area': 0,
  'Turnstiles': 1, // Page 5's image should go here, not Paid Main concourse
  'Paid Main concourse': 0,
  'Platforms': 1,
  'South side entrance (from arcade)': 0,
}

async function main() {
  const pdfPath = resolve(__dirname, '../../../docs/ExampleMappingNotes.pdf')
  console.log(`\nReading PDF: ${pdfPath}`)

  const pdfBuffer = readFileSync(pdfPath)
  console.log(`PDF size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`)

  const content = await extractPdfContent(pdfBuffer)

  console.log('\n=== EXTRACTION RESULTS ===')
  console.log(`Pages: ${content.pageCount}`)
  console.log(`Images: ${content.images.length}`)

  // Show images per page
  console.log('\n=== IMAGES PER PAGE ===')
  for (let page = 1; page <= content.pageCount; page++) {
    const pageImages = content.images.filter((img) => img.page === page)
    if (pageImages.length > 0) {
      console.log(`  Page ${page}: ${pageImages.length} image(s)`)
    }
  }

  // Run mapping
  console.log('\n=== MAPPING ===')
  const mappings = mapImagesByPageText(content.images, content.pageTexts, SECTION_TITLES)

  // Compare to expected
  console.log('\n=== RESULTS vs EXPECTED ===')
  let allCorrect = true
  for (const mapping of mappings) {
    const expected = EXPECTED[mapping.sectionTitle] ?? 0
    const actual = mapping.images.length
    const status = actual === expected ? '✓' : '✗'
    if (actual !== expected) allCorrect = false
    
    const pages = mapping.images.length > 0 
      ? ` (pages: ${[...new Set(mapping.images.map(i => i.page))].join(', ')})` 
      : ''
    console.log(`  ${status} "${mapping.sectionTitle}": ${actual} (expected ${expected})${pages}`)
  }

  console.log(`\n${allCorrect ? '✅ ALL CORRECT' : '❌ MISMATCHES FOUND'}`)
}

main()
