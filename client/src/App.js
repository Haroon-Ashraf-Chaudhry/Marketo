import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import './styles/global.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import { SocketProvider } from './hooks/useSocket';
import useAuthStore from './store/authStore';

// Pages
import HomePage from './pages/buyer/HomePage';
import ProductsPage from './pages/buyer/ProductsPage';
import ProductDetailPage from './pages/buyer/ProductDetailPage';
import CartPage from './pages/buyer/CartPage';
import CheckoutPage from './pages/buyer/CheckoutPage';
import OrdersPage from './pages/buyer/OrdersPage';
import OrderDetailPage from './pages/buyer/OrderDetailPage';
import ChatPage from './pages/buyer/ChatPage';
import ProfilePage from './pages/buyer/ProfilePage';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';
import VendorProductsPage from './pages/vendor/VendorProductsPage';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage';
import VendorAnalyticsPage from './pages/vendor/VendorAnalyticsPage';
import AdminDashboard from './pages/admin/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function AppContent() {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Auth required */}
          <Route path="/checkout" element={<ProtectedRoute roles={['buyer']}><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute roles={['buyer']}><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Vendor */}
          <Route path="/vendor/products" element={<ProtectedRoute roles={['vendor']}><VendorProductsPage /></ProtectedRoute>} />
          <Route path="/vendor/orders" element={<ProtectedRoute roles={['vendor']}><VendorOrdersPage /></ProtectedRoute>} />
          <Route path="/vendor/analytics" element={<ProtectedRoute roles={['vendor']}><VendorAnalyticsPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketProvider>
          <AppContent />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
