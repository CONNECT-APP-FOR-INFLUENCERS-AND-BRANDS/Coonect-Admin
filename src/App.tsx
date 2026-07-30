import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Login } from '@/pages/Login'
import { Overview } from '@/pages/Overview'
import { Brands } from '@/pages/Brands'
import { BrandDetail } from '@/pages/BrandDetail'
import { Influencers } from '@/pages/Influencers'
import { Collaborations } from '@/pages/Collaborations'
import { CollaborationDetail } from '@/pages/CollaborationDetail'
import { CancellationRequests } from '@/pages/CancellationRequests'
import { VerificationRequests } from '@/pages/VerificationRequests'

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (!user || !isAdmin) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RedirectIfSignedIn({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (user && isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfSignedIn>
            <Login />
          </RedirectIfSignedIn>
        }
      />
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Overview />} />
        <Route path="brands" element={<Brands />} />
        <Route path="brands/:id" element={<BrandDetail />} />
        <Route path="influencers" element={<Influencers />} />
        <Route path="collaborations" element={<Collaborations />} />
        <Route path="collaborations/:id" element={<CollaborationDetail />} />
        <Route path="cancellation-requests" element={<CancellationRequests />} />
        <Route path="verification-requests" element={<VerificationRequests />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
