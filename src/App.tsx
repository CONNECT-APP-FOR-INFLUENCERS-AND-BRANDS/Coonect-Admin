import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, type Location } from 'react-router-dom'
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
import { PaymentReleaseRequests } from '@/pages/PaymentReleaseRequests'
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

/**
 * Brand/Collaboration detail routes render as a modal over whichever list page
 * launched them (matches the design's "modal over dimmed list" treatment) by
 * reusing React Router's background-location pattern: the triggering Link sets
 * state.backgroundLocation, so the primary <Routes> keeps showing that
 * background page while a second <Routes> layers the detail route as a modal
 * on top. Direct navigation/refresh has no backgroundLocation, so the same
 * route falls back to rendering full-page (see `asModal` prop on the pages).
 */
function AppRoutes() {
  const location = useLocation()
  const backgroundLocation = (location.state as { backgroundLocation?: Location } | null)?.backgroundLocation

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
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
          <Route path="payment-release-requests" element={<PaymentReleaseRequests />} />
          <Route path="verification-requests" element={<VerificationRequests />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            element={
              <RequireAdmin>
                <Outlet />
              </RequireAdmin>
            }
          >
            <Route path="brands/:id" element={<BrandDetail asModal />} />
            <Route path="collaborations/:id" element={<CollaborationDetail asModal />} />
          </Route>
        </Routes>
      )}
    </>
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
