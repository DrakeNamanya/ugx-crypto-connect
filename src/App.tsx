
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { toast } from '@/components/ui/sonner';
import AuthProvider from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import KYCVerification from "./pages/KYCVerification";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";

// Set up React Query with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      meta: {
        onError: (error: any) => {
          console.error('Query error:', error);
          // Show a toast for network errors
          if (error?.message?.includes('network') || error?.message?.includes('Failed to fetch')) {
            toast.error('Network error. Please check your connection.');
          }
        }
      }
    },
  },
});

const App = () => {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AuthProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    {/* Protected Routes */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/kyc-verification" 
                      element={
                        <ProtectedRoute>
                          <KYCVerification />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* 404 Page */}
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </AuthProvider>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;
