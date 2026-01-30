import { createContext, useContext } from 'react'

export interface ApprovalContextValue {
  approved: boolean
  isSuperAdmin: boolean
  needsSetup: boolean
  loading: boolean
  error: string | null
  refetch: () => void
}

export const ApprovalContext = createContext<ApprovalContextValue | null>(null)

export function useApproval(): ApprovalContextValue {
  const context = useContext(ApprovalContext)
  if (!context) {
    throw new Error('useApproval must be used within ApprovalProvider')
  }
  return context
}
