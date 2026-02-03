import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import type { Guide } from '@/lib/schemas/guideSchema'
import { formatDate } from '@/shared/utils/formatDate'
import {
  getCategoryColoursFuzzy,
  getLevelColour as getSharedLevelColour,
  getLevelLabel,
  LEVEL_COLOURS,
} from '@/shared/utils/colours'
import { getOverallLevel } from '@/shared/utils/sensory'

// PDF-specific colours (non-sensory)
const pdfColours = {
  text: '#1A1A1A',
  textSecondary: '#3D3D3D',
  textMuted: '#595959',
  accent: '#B8510D',
  border: '#DDDDD9',
  surface: '#F8F8F6',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    color: pdfColours.text,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  meta: {
    fontSize: 9,
    color: pdfColours.textMuted,
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 9,
    color: pdfColours.textMuted,
  },
  introCard: {
    backgroundColor: pdfColours.surface,
    borderLeftWidth: 3,
    borderLeftColor: pdfColours.accent,
    padding: 12,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 4,
  },
  introText: {
    fontSize: 10,
    color: pdfColours.textSecondary,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E5',
    paddingBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    flex: 1,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelSquare: {
    width: 8,
    height: 8,
  },
  levelText: {
    fontSize: 9,
    fontWeight: 500,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    fontSize: 8,
    fontWeight: 500,
    textTransform: 'uppercase',
  },
  detailBlock: {
    marginBottom: 10,
    paddingLeft: 8,
  },
  detailCategory: {
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 2,
  },
  detailDescription: {
    fontSize: 10,
    color: pdfColours.textSecondary,
    lineHeight: 1.5,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  image: {
    width: 120,
    height: 90,
    objectFit: 'cover',
    borderRadius: 2,
  },
  facilitiesSection: {
    marginTop: 16,
  },
  facilitiesTitle: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 8,
  },
  facilityGroup: {
    marginBottom: 8,
  },
  facilityGroupTitle: {
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 4,
  },
  facilityItem: {
    fontSize: 10,
    color: pdfColours.textSecondary,
    marginBottom: 2,
    paddingLeft: 8,
  },
  sensoryKey: {
    marginTop: 20,
    padding: 12,
    backgroundColor: pdfColours.surface,
    borderRadius: 4,
  },
  sensoryKeyTitle: {
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    color: pdfColours.textMuted,
  },
  sensoryKeyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sensoryKeySquare: {
    width: 10,
    height: 10,
  },
  sensoryKeyText: {
    fontSize: 9,
    color: pdfColours.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: pdfColours.textMuted,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: pdfColours.textMuted,
  },
})

type PdfFilterMode = 'none' | 'highlighted' | 'filtered'

interface GuidePdfProps {
  guide: Guide
  /** Filter mode: none = standard, highlighted = show all with highlights, filtered = only matching */
  filterMode?: PdfFilterMode
  /** Categories to filter/highlight by */
  activeCategories?: Set<string>
}

/**
 * PDF document for Sensory Guide - Design System v5
 * Uses @react-pdf/renderer primitives
 * Supports filtering/highlighting based on user's sensory profile
 */
export function GuidePdf({ guide, filterMode = 'none', activeCategories = new Set() }: GuidePdfProps) {
  const { venue, areas, facilities, categories } = guide

  // Filter areas based on mode
  const sortedAreas = [...areas].sort((a, b) => a.order - b.order)
  const displayAreas = filterMode === 'filtered'
    ? sortedAreas.filter(area => area.badges.some(badge => activeCategories.has(badge)))
    : sortedAreas

  // Helper to check if content should be highlighted
  const shouldHighlight = (category: string) =>
    filterMode === 'highlighted' && activeCategories.has(category)

  // Generate filter header text
  const filterHeaderText = filterMode !== 'none' && activeCategories.size > 0
    ? `${filterMode === 'highlighted' ? 'Highlighted' : 'Filtered'} for: ${Array.from(activeCategories).join(', ')}`
    : null

  const hasAnyFacilities =
    facilities.exits.length > 0 ||
    facilities.bathrooms.length > 0 ||
    facilities.quietZones.length > 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{venue.name}</Text>
          <Text style={styles.meta}>
            {venue.address && `${venue.address} | `}
            Updated {formatDate(venue.lastUpdated || guide.generatedAt)}
          </Text>
          <Text style={styles.disclaimer}>
            Information may change. Verify details on arrival.
          </Text>
        </View>

        {/* Top-level category badges */}
        {categories && categories.length > 0 && (
          <View style={styles.badgeRow}>
            {categories.map((cat) => {
              const badgeColours = getCategoryColoursFuzzy(cat)
              return (
                <Text
                  key={cat}
                  style={[
                    styles.badge,
                    { backgroundColor: badgeColours.bg, color: badgeColours.text },
                  ]}
                >
                  {cat}
                </Text>
              )
            })}
          </View>
        )}

        {/* Filter header - shown when filters are active */}
        {filterHeaderText && (
          <View style={{ marginBottom: 12, padding: 8, backgroundColor: '#FEF7F2', borderRadius: 4 }}>
            <Text style={{ fontSize: 10, color: '#B8510D', fontWeight: 500 }}>
              {filterHeaderText}
            </Text>
          </View>
        )}

        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>About this guide</Text>
          <Text style={styles.introText}>
            {venue.summary ||
              'This guide describes what you might see, hear, and experience at each area of the venue.'}
          </Text>
        </View>

        {/* Areas */}
        {displayAreas.map((area) => {
          const overallLevel = getOverallLevel(area.details.map((d) => d.level))

          return (
            <View key={area.id} style={styles.section} wrap={false}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{area.name}</Text>
                <View style={styles.levelBadge}>
                  <View
                    style={[
                      styles.levelSquare,
                      { backgroundColor: getSharedLevelColour(overallLevel) },
                    ]}
                  />
                  <Text style={[styles.levelText, { color: getSharedLevelColour(overallLevel) }]}>
                    {getLevelLabel(overallLevel)}
                  </Text>
                </View>
              </View>

              {/* Category badges */}
              {area.badges && area.badges.length > 0 && (
                <View style={styles.badgeRow}>
                  {area.badges.map((badge) => {
                    const badgeColours = getCategoryColoursFuzzy(badge)
                    return (
                      <Text
                        key={badge}
                        style={[
                          styles.badge,
                          { backgroundColor: badgeColours.bg, color: badgeColours.text },
                        ]}
                      >
                        {badge}
                      </Text>
                    )
                  })}
                </View>
              )}

              {/* Images */}
              {area.images && area.images.length > 0 && (
                <View style={styles.imageRow}>
                  {area.images.slice(0, 3).map((imageUrl, idx) => (
                    <Image key={idx} src={imageUrl} style={styles.image} />
                  ))}
                </View>
              )}

              {/* Sensory details */}
              {area.details.map((detail, idx) => {
                const isHighlighted = shouldHighlight(detail.category)
                const highlightStyle = isHighlighted ? {
                  backgroundColor: '#FEF7F2',
                  borderLeftWidth: 2,
                  borderLeftColor: '#B8510D',
                  paddingLeft: 10,
                  marginLeft: 0,
                } : {}
                return (
                  <View
                    key={idx}
                    style={[styles.detailBlock, highlightStyle]}
                  >
                    <Text style={styles.detailCategory}>
                      {detail.category}
                      {' '}
                      <Text style={{ color: getSharedLevelColour(detail.level), fontWeight: 500 }}>
                        ({getLevelLabel(detail.level)})
                      </Text>
                    </Text>
                    <Text style={styles.detailDescription}>{detail.description}</Text>
                  </View>
                )
              })}
            </View>
          )
        })}

        {/* Facilities */}
        {hasAnyFacilities && (
          <View style={styles.facilitiesSection} wrap={false}>
            <Text style={styles.facilitiesTitle}>Key Facilities</Text>

            {facilities.exits.length > 0 && (
              <View style={styles.facilityGroup}>
                <Text style={styles.facilityGroupTitle}>Exits</Text>
                {facilities.exits.map((exit, i) => (
                  <Text key={i} style={styles.facilityItem}>
                    {'\u2022'} {exit.description}
                  </Text>
                ))}
              </View>
            )}

            {facilities.bathrooms.length > 0 && (
              <View style={styles.facilityGroup}>
                <Text style={styles.facilityGroupTitle}>Bathrooms</Text>
                {facilities.bathrooms.map((bathroom, i) => (
                  <Text key={i} style={styles.facilityItem}>
                    {'\u2022'} {bathroom.description}
                  </Text>
                ))}
              </View>
            )}

            {facilities.quietZones.length > 0 && (
              <View style={styles.facilityGroup}>
                <Text style={styles.facilityGroupTitle}>Quiet Zones</Text>
                {facilities.quietZones.map((zone, i) => (
                  <Text key={i} style={styles.facilityItem}>
                    {'\u2022'} {zone.description}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Sensory Key */}
        <View style={styles.sensoryKey} wrap={false}>
          <Text style={styles.sensoryKeyTitle}>Sensory Level Key</Text>
          <View style={styles.sensoryKeyItem}>
            <View style={[styles.sensoryKeySquare, { backgroundColor: LEVEL_COLOURS.low }]} />
            <Text style={styles.sensoryKeyText}>Low - Generally calm</Text>
          </View>
          <View style={styles.sensoryKeyItem}>
            <View style={[styles.sensoryKeySquare, { backgroundColor: LEVEL_COLOURS.medium }]} />
            <Text style={styles.sensoryKeyText}>Medium - Some activity</Text>
          </View>
          <View style={styles.sensoryKeyItem}>
            <View style={[styles.sensoryKeySquare, { backgroundColor: LEVEL_COLOURS.high }]} />
            <Text style={styles.sensoryKeyText}>High - May be overwhelming</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Sensory Guide</Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
