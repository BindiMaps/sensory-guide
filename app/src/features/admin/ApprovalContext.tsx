import { createContext, useContext, type ReactNode } from 'react'
import { useApprovalStatus } from '@/shared/hooks/useApprovalStatus'

interface ApprovalContextValue {
  approved: boolean
  isSuperAdmin: boolean
  needsSetup: boolean
  loading: boolean
  error: string | null
  refetch: () => void
}

const ApprovalContext = createContext<ApprovalContextValue | null>(null)

export function ApprovalProvider({ children }: { children: ReactNode }) {
  const approval = useApprovalStatus()
  return (
    <ApprovalContext.Provider value={approval}>
      {children}
    </ApprovalContext.Provider>
  )
}

export function useApproval(): ApprovalContextValue {
  const context = useContext(ApprovalContext)
  if (!context) {
    throw new Error('useApproval must be used within ApprovalProvider')
  }
  return context
}
