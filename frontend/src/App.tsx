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

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Main ERP Layout */}
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

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
