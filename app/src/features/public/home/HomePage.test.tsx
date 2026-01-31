import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { HomePage } from './HomePage'

function renderHomePage() {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
}

describe('HomePage', () => {
  describe('Content', () => {
    it('renders BindiMaps logo images', () => {
      renderHomePage()
      const images = screen.getAllByAltText('BindiMaps')
      expect(images).toHaveLength(2) // Icon in header, full logo in footer
    })

    it('renders Sensory Guide heading', () => {
      renderHomePage()
      expect(
        screen.getByRole('heading', { name: /sensory guide/i, level: 1 })
      ).toBeInTheDocument()
    })

    it('renders explanation of Sensory Guides', () => {
      renderHomePage()
      expect(
        screen.getByText(/helping people with sensory sensitivities/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/sounds, lighting, crowds/i)
      ).toBeInTheDocument()
    })

    it('renders admin portal link with CTA text', () => {
      renderHomePage()
      const link = screen.getByRole('link', { name: /create a guide for your venue/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin')
    })

    it('renders powered by link to bindimaps.com', () => {
      renderHomePage()
      const link = screen.getByRole('link', { name: /powered by/i })
      expect(link).toHaveAttribute('href', 'https://bindimaps.com')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  describe('Semantic Structure', () => {
    it('has main landmark', () => {
      renderHomePage()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('has proper heading hierarchy with h1', () => {
      renderHomePage()
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
      expect(h1).toHaveTextContent('Sensory Guide')
    })
  })

  describe('Accessibility', () => {
    it('link has focus-visible styling classes', () => {
      renderHomePage()
      const link = screen.getByRole('link', { name: /create a guide for your venue/i })
      expect(link.className).toContain('focus-visible:')
    })

    it('link is keyboard accessible (is an anchor element)', () => {
      renderHomePage()
      const link = screen.getByRole('link', { name: /create a guide for your venue/i })
      expect(link.tagName).toBe('A')
    })

    it('images have alt text', () => {
      renderHomePage()
      const images = screen.getAllByRole('img')
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).not.toBe('')
      })
    })
  })

  describe('Design System v5 Compliance', () => {
    it('uses v5 text colour for heading', () => {
      renderHomePage()
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveStyle({ color: 'rgb(26, 26, 26)' }) // #1A1A1A
    })

    it('CTA section has v5 accent border colour', () => {
      renderHomePage()
      const ctaText = screen.getByText(/are you a venue owner/i)
      const ctaSection = ctaText.parentElement
      expect(ctaSection).toHaveStyle({ borderColor: 'rgb(184, 81, 13)' }) // #B8510D
    })
  })
})
