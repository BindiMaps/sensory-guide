import { type ReactNode } from 'react'
import { useApprovalStatus } from '@/shared/hooks/useApprovalStatus'
import { ApprovalContext } from './useApproval'

export function ApprovalProvider({ children }: { children: ReactNode }) {
  const approval = useApprovalStatus()
  return (
    <ApprovalContext.Provider value={approval}>
      {children}
    </ApprovalContext.Provider>
  )
}
