import "./index.css";

import { Toaster } from "sonner";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Index from "./pages/home/Home";
import NotFound from "./pages/NotFound";
import RootLayout from "./pages/RootLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import AdminLogin from "./pages/admin/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import Signup from "./pages/auth/Signup";
import TechSetup from "./pages/TechSetup";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import AuthGuard from "./components/AuthGuard";
import PublicOnly from "./components/PublicOnly";
import RoleGuard from "./components/RoleGuard";
import RoleRedirect from "./components/RoleRedirect";
import { SocketProvider } from "./context/SocketProvider";
import CustomerOverview from "./modules/customer/pages/Overview";
import CustomerJobDetails from "./modules/customer/pages/JobDetails";
import CustomerMessages from "./modules/customer/pages/Messages";
import CustomerSettings from "./modules/customer/pages/Settings";
import CustomerSearch from "./modules/customer/pages/Search";
import CustomerBookings from "./modules/customer/pages/Bookings";
import CustomerHistory from "./modules/customer/pages/History";
import CustomerReviews from "./modules/customer/pages/Reviews";
import CustomerDashboard from "./modules/customer/pages/Dashboard";
import theme from "./theme";
import AdminDashboard from "./modules/admin/pages/Dashboard";
import AdminTechnicians from "./modules/admin/pages/Technicians";
import AdminCustomers from "./modules/admin/pages/Customers";
import AdminLayout from "./modules/admin/layout/AdminLayout";
import TechnicianRequests from "./modules/technician/pages/Requests";
import TechnicianAvailability from "./modules/technician/pages/Availability";
import TechnicianSettings from "./modules/technician/pages/Settings";
import TechnicianDashboard from "./modules/technician/pages/Dashboard";
import CustomerAssistant from "./modules/customer/pages/Assistant";
import TechnicianAssistant from "./modules/technician/pages/Assistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SocketProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<AuthGuard><Dashboard /></AuthGuard>}>
              <Route index element={<RoleRedirect />} />
              {/* Admin routes */}
              <Route path="admin" element={<RoleGuard expect="admin"><AdminLayout /></RoleGuard>}>
                <Route index element={<AdminDashboard />} />
                <Route path="overview" element={<AdminDashboard />} />
                <Route path="technicians" element={<AdminTechnicians />} />
                <Route path="customers" element={<AdminCustomers />} />
              </Route>
              <Route path="customer" element={<RoleGuard expect="user"><CustomerOverview /></RoleGuard>} />
              <Route path="customer/overview" element={<RoleGuard expect="user"><CustomerOverview /></RoleGuard>} />
              <Route path="customer/dashboard" element={<RoleGuard expect="user"><CustomerDashboard /></RoleGuard>} />
              <Route path="customer/search" element={<RoleGuard expect="user"><CustomerSearch /></RoleGuard>} />
              <Route path="customer/bookings" element={<RoleGuard expect="user"><CustomerBookings /></RoleGuard>} />
              <Route path="customer/history" element={<RoleGuard expect="user"><CustomerHistory /></RoleGuard>} />
              <Route path="customer/reviews" element={<RoleGuard expect="user"><CustomerReviews /></RoleGuard>} />
              <Route path="customer/job/:jobId" element={<RoleGuard expect="user"><CustomerJobDetails /></RoleGuard>} />
              <Route path="customer/messages" element={<RoleGuard expect="user"><CustomerMessages /></RoleGuard>} />
              <Route path="customer/assistant" element={<RoleGuard expect="user"><CustomerAssistant /></RoleGuard>} />
              <Route path="customer/settings" element={<RoleGuard expect="user"><CustomerSettings /></RoleGuard>} />
              <Route path="technician" element={<RoleGuard expect="tech"><TechnicianDashboard /></RoleGuard>} />
              <Route path="technician/overview" element={<RoleGuard expect="tech"><TechnicianDashboard /></RoleGuard>} />
              <Route path="technician/dashboard" element={<RoleGuard expect="tech"><TechnicianDashboard /></RoleGuard>} />
              <Route path="technician/jobs" element={<RoleGuard expect="tech"><TechnicianRequests /></RoleGuard>} />
              {/** Legacy dashboards removed */}
              <Route path="technician/requests" element={<RoleGuard expect="tech"><TechnicianRequests /></RoleGuard>} />
              <Route path="technician/availability" element={<RoleGuard expect="tech"><TechnicianAvailability /></RoleGuard>} />
              <Route path="technician/settings" element={<RoleGuard expect="tech"><TechnicianSettings /></RoleGuard>} />
              <Route path="technician/assistant" element={<RoleGuard expect="tech"><TechnicianAssistant /></RoleGuard>} />
            </Route>
            <Route path="profile" element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            } />
            <Route path="login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="admin/login" element={<PublicOnly><AdminLogin /></PublicOnly>} />
            <Route path="forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
            <Route path="signup" element={<PublicOnly><Signup /></PublicOnly>} />
            <Route path="tech-setup" element={<TechSetup />} />
            <Route path="auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          </Routes>
        </BrowserRouter>
        </SocketProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;