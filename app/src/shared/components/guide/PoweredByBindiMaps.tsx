import bindiLogo from '@/assets/BindiMaps-logo.png'

/**
 * "Powered by BindiMaps" attribution link.
 * Used in guide footers and landing page.
 */
export function PoweredByBindiMaps() {
  return (
    <a
      href="https://bindimaps.com"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2 rounded-sm"
    >
      <span className="text-xs text-[#595959]">Powered by</span>
      <img src={bindiLogo} alt="BindiMaps" className="h-6 w-auto" />
    </a>
  )
}
