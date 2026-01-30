import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PublicLayout } from '@/features/public/PublicLayout'
import { AdminLayout } from '@/features/admin/AdminLayout'
import { HomePage } from '@/features/public/home/HomePage'
import { GuidePage } from '@/features/public/guide/GuidePage'
import { AdminDashboard } from '@/features/admin/AdminDashboard'
import { LoginPage } from '@/features/admin/LoginPage'
import { VenueDetail } from '@/features/admin/VenueDetail'
import { CreateVenue } from '@/features/admin/CreateVenue'
import { SuperAdminDashboard } from '@/features/admin/super-admin/SuperAdminDashboard'
import { VersionPreviewPage } from '@/features/admin/guides/VersionPreviewPage'
import { NotFound } from '@/features/public/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/venue/:slug" element={<GuidePage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="venues/new" element={<CreateVenue />} />
          <Route path="venues/:id" element={<VenueDetail />} />
          <Route path="super-admin" element={<SuperAdminDashboard />} />
          <Route path="preview" element={<VersionPreviewPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
