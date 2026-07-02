import React, { Suspense, lazy, useEffect } from 'react'
// Cache busting update
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import './index.css'

// ── Lazy-load portals ─────────────────────────────────────
const BrandMoodboard   = lazy(() => import('./portals/brand/BrandMoodboard'))
const StoreLayout      = lazy(() => import('./portals/store/StoreLayout'))
const StoreLanding     = lazy(() => import('./portals/store/StoreLanding'))
const AboutUs          = lazy(() => import('./portals/store/AboutUs'))
// Removed PrivacyPolicy import as it is now combined with TermsOfService
const TermsOfService   = lazy(() => import('./portals/store/TermsOfService'))
const SellerLanding    = lazy(() => import('./portals/store/SellerLanding'))
const TiendaLanding    = lazy(() => import('./portals/store/TiendaLanding'))

const AdminLogin       = lazy(() => import('./portals/admin/AdminLogin'))
const AdminLayout      = lazy(() => import('./portals/admin/AdminLayout'))
const AdminDashboard   = lazy(() => import('./portals/admin/pages/AdminDashboard'))
const AdminInventory   = lazy(() => import('./portals/admin/pages/AdminInventory'))
const AdminSellers     = lazy(() => import('./portals/admin/pages/AdminSellers'))
const AdminSellerDetail= lazy(() => import('./portals/admin/pages/AdminSellerDetail'))
const AdminStores      = lazy(() => import('./portals/admin/pages/AdminStores'))
const AdminRestock     = lazy(() => import('./portals/admin/pages/AdminRestock'))
const AdminStoreDetail = lazy(() => import('./portals/admin/pages/AdminStoreDetail'))
const AdminVisits      = lazy(() => import('./portals/admin/pages/AdminVisits'))
const AdminMap         = lazy(() => import('./portals/admin/pages/AdminMap'))
const AdminAgreements  = lazy(() => import('./portals/admin/pages/AdminAgreements'))
const AdminPanic       = lazy(() => import('./portals/admin/pages/AdminPanic'))
const AdminSales       = lazy(() => import('./portals/admin/pages/AdminSales'))
const AdminSettings    = lazy(() => import('./portals/admin/pages/AdminSettings'))

const SellerLogin      = lazy(() => import('./portals/seller/SellerLogin'))
const SellerLayout     = lazy(() => import('./portals/seller/SellerLayout'))
const SellerHome       = lazy(() => import('./portals/seller/pages/SellerHome'))
const SellerCatalog    = lazy(() => import('./portals/seller/pages/SellerCatalog'))
const SellerPurchases  = lazy(() => import('./portals/seller/pages/SellerPurchases'))
const SellerSales      = lazy(() => import('./portals/seller/pages/SellerSales'))
const SellerVisits     = lazy(() => import('./portals/seller/pages/SellerVisits'))
const SellerAgreement  = lazy(() => import('./portals/seller/pages/SellerAgreement'))
const SellerCortes     = lazy(() => import('./portals/seller/pages/SellerCortes'))
const SellerPanic      = lazy(() => import('./portals/seller/pages/SellerPanic'))
const SellerNewStore   = lazy(() => import('./portals/seller/pages/SellerNewStore'))

const TiendaLogin      = lazy(() => import('./portals/tienda/TiendaLogin'))
const TiendaLayout     = lazy(() => import('./portals/tienda/TiendaLayout'))
const TiendaHome       = lazy(() => import('./portals/tienda/pages/TiendaHome'))
const TiendaAgreement  = lazy(() => import('./portals/tienda/pages/TiendaAgreement'))
const TiendaPurchases  = lazy(() => import('./portals/tienda/pages/TiendaPurchases'))
const TiendaSigning    = lazy(() => import('./portals/tienda/pages/TiendaSigning'))
const TiendaPanic      = lazy(() => import('./portals/tienda/pages/TiendaPanic'))

// ── Query Client ──────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
})

// ── Portal Loading Spinner ─────────────────────────────────
function PortalLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--color-bg-consumer)',
      flexDirection: 'column', gap: '1rem',
    }}>
      <div style={{ fontSize: '3rem' }} className="animate-jiggle">🐻</div>
      <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', fontWeight: 700 }}>
        Cargando...
      </p>
    </div>
  )
}

// ── Protected Route Guards ─────────────────────────────────
function RequireAdmin({ children }) {
  const { role, loading } = useAuthStore()
  if (loading) return <PortalLoader />
  if (role !== 'admin') return <Navigate to="/admin" replace />
  return <>{children}</>
}

function RequireSeller({ children }) {
  const { role, loading } = useAuthStore()
  if (loading) return <PortalLoader />
  if (!role || (role !== 'seller' && role !== 'admin')) return <Navigate to="/seller" replace />
  return <>{children}</>
}

function RequireTienda({ children }) {
  const { role, loading } = useAuthStore()
  if (loading) return <PortalLoader />
  if (!role || (role !== 'store' && role !== 'admin')) return <Navigate to="/tienda" replace />
  return <>{children}</>
}

// ── App ───────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color:'red'}}><h1>Something went wrong.</h1><pre>{this.state.error?.toString()}</pre></div>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<PortalLoader />}>
            <Routes>
              {/* ── Brand / Landing ── */}
              <Route element={<StoreLayout />}>
                <Route path="/" element={<StoreLanding />} />
                <Route path="/nosotros" element={<AboutUs />} />
                <Route path="/privacidad" element={<Navigate to="/terminos" replace />} />
                <Route path="/terminos" element={<TermsOfService />} />
                <Route path="/mayoristas" element={<SellerLanding />} />
                <Route path="/tienditas" element={<TiendaLanding />} />
              </Route>
              
              <Route path="/brand" element={<BrandMoodboard />} />

              {/* ── Consumer Store ── */}
              <Route path="/menu" element={<Navigate to="/#bundles" replace />} />
              <Route path="/pago/exito"    element={<StoreLayout><StoreLanding /></StoreLayout>} />
              <Route path="/pago/pendiente" element={<StoreLayout><StoreLanding /></StoreLayout>} />
              <Route path="/pago/fallo"    element={<StoreLayout><StoreLanding /></StoreLayout>} />

              {/* ── Admin Portal ── */}
              <Route path="/admin">
                <Route index element={<AdminLogin />} />
                <Route element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }>
                  <Route path="dashboard"  element={<AdminDashboard />} />
                  <Route path="inventario" element={<AdminInventory />} />
                  <Route path="resurtido"  element={<AdminRestock />} />
                  <Route path="vendedores" element={<AdminSellers />} />
                  <Route path="vendedores/:id" element={<AdminSellerDetail />} />
                  <Route path="tiendas"    element={<AdminStores />} />
                  <Route path="tiendas/:id" element={<AdminStoreDetail />} />
                  <Route path="visitas"    element={<AdminVisits />} />
                  <Route path="mapa"       element={<AdminMap />} />
                  <Route path="ventas"     element={<AdminSales />} />
                  <Route path="acuerdos"   element={<AdminAgreements />} />
                  <Route path="alertas"    element={<AdminPanic />} />
                  <Route path="config"     element={<AdminSettings />} />
                </Route>
              </Route>

              {/* ── Seller Portal ── */}
              <Route path="/seller">
                <Route index element={<SellerLogin />} />
                <Route element={
                  <RequireSeller>
                    <SellerLayout />
                  </RequireSeller>
                }>
                  <Route path="home"      element={<SellerHome />} />
                  <Route path="catalogo"  element={<SellerCatalog />} />
                  <Route path="compras"   element={<SellerPurchases />} />
                  <Route path="ventas"    element={<SellerSales />} />
                  <Route path="visitas"   element={<SellerVisits />} />
                  <Route path="acuerdo"   element={<SellerAgreement />} />
                  <Route path="acuerdo/:storeIdParam" element={<SellerAgreement />} />
                  <Route path="cortes"    element={<SellerCortes />} />
                  <Route path="panico"    element={<SellerPanic />} />
                  <Route path="nueva-tienda" element={<SellerNewStore />} />
                </Route>
              </Route>

              {/* ── Tienda Portal ── */}
              <Route path="/tienda">
                <Route index element={<TiendaLogin />} />
                <Route element={
                  <RequireTienda>
                    <TiendaLayout />
                  </RequireTienda>
                }>
                  <Route path="inicio"    element={<TiendaHome />} />
                  <Route path="acuerdo"   element={<TiendaAgreement />} />
                  <Route path="pedidos"   element={<TiendaPurchases />} />
                  <Route path="firmar/:id" element={<TiendaSigning />} />
                  <Route path="panico"    element={<TiendaPanic />} />
                </Route>
              </Route>

              {/* ── 404 ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
