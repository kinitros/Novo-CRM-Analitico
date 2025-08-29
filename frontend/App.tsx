import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import InactiveCustomers from "./pages/InactiveCustomers";
import CustomerSegmentation from "./pages/CustomerSegmentation";
import AdvancedProductAnalytics from "./pages/AdvancedProductAnalytics";
import CRMIntegration from "./pages/CRMIntegration";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import BusinessIntelligence from "./pages/BusinessIntelligence";
import Customer360 from "./pages/Customer360";
import AdvancedSales from "./pages/AdvancedSales";
import SaleDetails from "./pages/SaleDetails";
import Login from "./pages/Login";
import JWTIntegration from "./pages/JWTIntegration";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rota de Login (não protegida) */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas Principais (acesso livre temporariamente) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
            <Route path="/business-intelligence" element={<BusinessIntelligence />} />
            <Route path="/customer-360/:email" element={<Customer360 />} />
            <Route path="/advanced-sales" element={<AdvancedSales />} />
            <Route path="/sale-details/:idTransacao" element={<SaleDetails />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/inactive-customers" element={<InactiveCustomers />} />
            <Route path="/customer-segmentation" element={<CustomerSegmentation />} />
            <Route path="/advanced-products" element={<AdvancedProductAnalytics />} />
            <Route path="/crm-integration" element={<CRMIntegration />} />
            <Route path="/jwt-integration" element={<JWTIntegration />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
