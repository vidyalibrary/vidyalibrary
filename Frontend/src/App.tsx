import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ActiveStudents from "./pages/ActiveStudents";
import AllStudents from "./pages/AllStudents";
import ExpiredMemberships from "./pages/ExpiredMemberships";
import ExpiringMembershipsPage from "./pages/ExpiringMembershipsPage"; // Import the new page
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import StudentDetails from "./pages/StudentDetails";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/students" element={
        <ProtectedRoute>
          <AllStudents />
        </ProtectedRoute>
      } />
      <Route path="/students/add" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/active-students" element={
        <ProtectedRoute>
          <ActiveStudents />
        </ProtectedRoute>
      } />
      <Route path="/expired-memberships" element={
        <ProtectedRoute>
          <ExpiredMemberships />
        </ProtectedRoute>
      } />
      <Route path="/expiring-memberships" element={
        <ProtectedRoute>
          <ExpiringMembershipsPage />
        </ProtectedRoute>
      } /> {/* New route for expiring memberships */}
      <Route path="/schedule" element={
        <ProtectedRoute>
          <Schedule />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/students/:id" element={
        <ProtectedRoute>
          <StudentDetails />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;