import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PublicLayout } from '@/features/public/PublicLayout'
import { HomePage } from '@/features/public/home/HomePage'
import { GuidePage } from '@/features/public/guide/GuidePage'
import { NotFound } from '@/features/public/NotFound'

// Lazy load admin routes - keeps initial bundle small for public users
const AdminLayout = lazy(() => import('@/features/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const LoginPage = lazy(() => import('@/features/admin/LoginPage').then(m => ({ default: m.LoginPage })))
const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const VenueDetail = lazy(() => import('@/features/admin/VenueDetail').then(m => ({ default: m.VenueDetail })))
const CreateVenue = lazy(() => import('@/features/admin/CreateVenue').then(m => ({ default: m.CreateVenue })))
const SuperAdminDashboard = lazy(() => import('@/features/admin/super-admin/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })))
const VersionPreviewPage = lazy(() => import('@/features/admin/guides/VersionPreviewPage').then(m => ({ default: m.VersionPreviewPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin text-[#B8510D]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" />
        </svg>
        <span className="text-sm text-[#595959]">Loading...</span>
      </div>
    </div>
  )
}

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

        {/* Admin routes - lazy loaded */}
        <Route path="/admin/login" element={
          <Suspense fallback={<AdminLoadingFallback />}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/admin" element={
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminLayout />
          </Suspense>
        }>
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
