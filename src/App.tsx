
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientInvite from "./pages/ClientInvite";
import NotFound from "./pages/NotFound";

// Dashboard pages
import CoachDashboard from "./pages/coach/Dashboard";
import CoachClients from "./pages/coach/Clients";
import CoachSessions from "./pages/coach/Sessions";
import CoachMessages from "./pages/coach/Messages";
import CoachProfile from "./pages/coach/Profile";
import CoachInvite from "./pages/coach/Invite";
import CoachResources from "./pages/coach/Resources";
import CoachInvoices from "./pages/coach/Invoices";
import CoachEngagements from "./pages/coach/Engagements";

// Client pages
import ClientDashboard from "./pages/client/Dashboard";
import ClientCoaches from "./pages/client/Coaches";
import ClientSessions from "./pages/client/Sessions";
import ClientMessages from "./pages/client/Messages";
import ClientProfile from "./pages/client/Profile";
import ClientResources from "./pages/client/Resources";
import ClientInvoices from "./pages/client/Invoices";
import ClientEngagements from "./pages/client/Engagements";

// Auth context and protected routes
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout components
import CoachLayout from "./components/layouts/CoachLayout";
import ClientLayout from "./components/layouts/ClientLayout";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for animation purposes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/invite/:inviteId" element={<ClientInvite />} />
              
              {/* Coach routes */}
              <Route path="/coach" element={
                <ProtectedRoute allowedRole="coach">
                  <CoachLayout />
                </ProtectedRoute>
              }>
                <Route index element={<CoachDashboard />} />
                <Route path="clients" element={<CoachClients />} />
                <Route path="sessions" element={<CoachSessions />} />
                {/* Add optional conversationId param */}
                <Route path="messages/:conversationId?" element={<CoachMessages />} />
                <Route path="profile" element={<CoachProfile />} />
                <Route path="invite" element={<CoachInvite />} />
                <Route path="resources" element={<CoachResources />} />
                <Route path="invoices" element={<CoachInvoices />} />
                <Route path="engagements" element={<CoachEngagements />} />
              </Route>
              
              {/* Client routes */}
              <Route path="/client" element={
                <ProtectedRoute allowedRole="client">
                  <ClientLayout />
                </ProtectedRoute>
              }>
                <Route index element={<ClientDashboard />} />
                <Route path="coaches" element={<ClientCoaches />} />
                <Route path="sessions" element={<ClientSessions />} />
                <Route path="messages" element={<ClientMessages />} />
                <Route path="profile" element={<ClientProfile />} />
                <Route path="resources" element={<ClientResources />} />
                <Route path="invoices" element={<ClientInvoices />} />
                <Route path="engagements" element={<ClientEngagements />} />
              </Route>
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
