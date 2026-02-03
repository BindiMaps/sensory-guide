import { useState } from 'react'

const helpContent = [
  {
    title: 'Dashboard',
    items: [
      'View all venues you have access to',
      'Click a venue card to manage it',
      'Use "Create New Venue" to add a venue',
    ],
  },
  {
    title: 'Venue Management',
    items: [
      'Upload a PDF to generate a sensory guide',
      'Add/remove editors who can collaborate',
      'View version history and rollback if needed',
      'Click "View Feedback" to see user ratings',
    ],
  },
  {
    title: 'Guide Workflow',
    items: [
      '1. Upload PDF → 2. Wait for processing → 3. Preview → 4. Publish',
      'Edit embeds to add BindiMaps maps and YouTube videos for sections',
      'Edit images to assign extracted images to areas (sometimes the AI gets these wrong)',
      'Re-upload PDF to regenerate',
    ],
  },
  {
    title: 'Super Admin',
    items: [
      'Manage allow list for venue creators',
      'View global analytics across all venues',
    ],
  },
]

export function AdminHelpPopup() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-muted-foreground hover:text-foreground"
        aria-label="Help"
      >
        Help
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-background border rounded-sm max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Admin Help</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {helpContent.map((section) => (
                <div key={section.title}>
                  <h3 className="font-medium text-sm mb-1">{section.title}</h3>
                  <ul className="text-sm text-muted-foreground space-y-0.5">
                    {section.items.map((item, i) => (
                      <li key={i} className="pl-2">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
