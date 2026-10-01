import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import InventoryPage from "./pages/Inventory/InventoryPage";
import RequisitionsPage from "./pages/Procurement/RequisitionsPage";
import OrdersPage from "./pages/Procurement/OrdersPage";
import GoodsReceiptPage from "./pages/GoodsReceipt/GoodsReceiptPage";
import AlertsPage from "./pages/Alerts/AlertsPage";
import MovementsPage from "./pages/Movements/MovementsPage";
import SuppliersPage from "./pages/Suppliers/SuppliersPage";
import ProductsPage from "./pages/Products/ProductsPage";
import NotFound from "./pages/OtherPage/NotFound";
import Forbidden from "./pages/OtherPage/Forbidden";
import LoginPage from "./pages/Auth/LoginPage";
import SignUpPage from "./pages/Auth/SignUpPage";

import { ToastProvider } from "./shared/context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forbidden" element={<Forbidden />} />

            {/* Protected ERP Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index path="/" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/requisitions" element={<RequisitionsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/goods-receipt" element={<GoodsReceiptPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/movements" element={<MovementsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
