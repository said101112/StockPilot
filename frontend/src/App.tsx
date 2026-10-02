import { lazy, Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { PageFallback } from "./components/common/PageFallback";
import AppLayout from "./layout/AppLayout";
import { ToastProvider } from "./shared/context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Lazy loading à la demande des pages ERP pour accélérer le chargement initial (Code Splitting)
const DashboardPage = lazy(() => import("./pages/Dashboard/DashboardPage"));
const InventoryPage = lazy(() => import("./pages/Inventory/InventoryPage"));
const RequisitionsPage = lazy(() => import("./pages/Procurement/RequisitionsPage"));
const OrdersPage = lazy(() => import("./pages/Procurement/OrdersPage"));
const GoodsReceiptPage = lazy(() => import("./pages/GoodsReceipt/GoodsReceiptPage"));
const AlertsPage = lazy(() => import("./pages/Alerts/AlertsPage"));
const MovementsPage = lazy(() => import("./pages/Movements/MovementsPage"));
const SuppliersPage = lazy(() => import("./pages/Suppliers/SuppliersPage"));
const ProductsPage = lazy(() => import("./pages/Products/ProductsPage"));
const PurchasingInfoRecordPage = lazy(() => import("./pages/Procurement/PurchasingInfoRecordPage"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const Forbidden = lazy(() => import("./pages/OtherPage/Forbidden"));
const LoginPage = lazy(() => import("./pages/Auth/LoginPage"));
const SignUpPage = lazy(() => import("./pages/Auth/SignUpPage"));

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signin" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forbidden" element={<Forbidden />} />

              {/* Protected ERP Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* Routes accessibles à tous les rôles authentifiés (ADMIN, MANAGER, USER) */}
                  <Route index path="/" element={<DashboardPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/requisitions" element={<RequisitionsPage />} />
                  <Route path="/goods-receipt" element={<GoodsReceiptPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/movements" element={<MovementsPage />} />

                  {/* Routes réservées aux Achats & Gestion (ADMIN & MANAGER uniquement) */}
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
                    <Route path="/suppliers" element={<SuppliersPage />} />
                    <Route path="/purchasing-info-records" element={<PurchasingInfoRecordPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
