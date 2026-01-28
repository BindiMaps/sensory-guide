import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/features/public/PublicLayout'
import { AdminLayout } from '@/features/admin/AdminLayout'
import { HomePage } from '@/features/public/home/HomePage'
import { GuidePage } from '@/features/public/guide/GuidePage'
import { AdminDashboard } from '@/features/admin/AdminDashboard'
import { NotFound } from '@/features/public/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/venue/:slug" element={<GuidePage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
