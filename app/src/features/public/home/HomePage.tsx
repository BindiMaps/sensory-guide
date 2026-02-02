import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import bindiIcon from '@/assets/BindiMaps-Icon.png'
import bindiLogo from '@/assets/BindiMaps-logo.png'

/**
 * Public landing page for Sensory Guide.
 *
 * Design: v5 design system (warm, calming aesthetic)
 * Bundle: No Firebase SDK, minimal dependencies
 */
export function HomePage() {
  useEffect(() => {
    document.title = 'Sensory Guide - BindiMaps'
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <div
        className="mx-auto max-w-3xl px-6 py-16"
        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
      >
        {/* BindiMaps Icon Header */}
        <div className="mb-8">
          <img
            src={bindiIcon}
            alt="BindiMaps"
            className="h-10 w-auto"
          />
        </div>

        {/* Hero Section */}
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: '#1A1A1A', lineHeight: 1.2 }}
        >
          Sensory Guide
        </h1>

        <p
          className="text-base mb-6"
          style={{ color: '#3D3D3D', lineHeight: 1.55 }}
        >
          Helping people with sensory sensitivities plan venue visits with confidence.
        </p>

        <p
          className="text-sm mb-10"
          style={{ color: '#595959', lineHeight: 1.6 }}
        >
          Sensory Guides provide detailed information about sounds, lighting, crowds,
          smells, and other sensory experiences at venues - helping people with autism,
          anxiety, and sensory processing differences prepare for their visit.
        </p>

        {/* CTA Section */}
        <div
          className="border-l-[3px] pl-5 py-3 mb-10"
          style={{ borderColor: '#B8510D', backgroundColor: '#F8F8F6' }}
        >
          <p
            className="text-sm mb-3"
            style={{ color: '#3D3D3D' }}
          >
            Are you a venue owner?
          </p>
          <Link
            to="/admin"
            className="inline-block text-sm font-medium underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              color: '#B8510D',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#9A4409'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#B8510D'
            }}
          >
            Create a guide for your venue
          </Link>
        </div>

        {/* Footer Attribution */}
        <a
          href="https://bindimaps.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2 rounded-sm"
        >
          <span
            className="text-xs"
            style={{ color: '#595959' }}
          >
            Powered by
          </span>
          <img
            src={bindiLogo}
            alt="BindiMaps"
            className="h-6 w-auto"
          />
        </a>
      </div>
    </main>
  )
}
