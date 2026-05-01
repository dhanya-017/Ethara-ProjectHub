import { Toaster } from "@/components/ui/toaster.jsx"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from "@/lib/query-client.js";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from "@/lib/PageNotFound.jsx";
import { AuthProvider, useAuth } from "@/lib/AuthContext.jsx";
import UserNotRegisteredError from "@/components/UserNotRegisteredError.jsx";
import AppLayout from "@/components/layout/AppLayout.jsx";
import Dashboard from "@/pages/Dashboard.jsx";
import Projects from "@/pages/Projects.jsx";
import ProjectDetail from "@/pages/ProjectDetail.jsx";
import Tasks from "@/pages/Tasks.jsx";
import Team from "@/pages/Team.jsx";
import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx";
import ForgotPassword from "@/pages/ForgotPassword.jsx";
import ResetPassword from "@/pages/ResetPassword.jsx";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, authChecked, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If auth check is complete and user is not authenticated, show login page
  if (authChecked && !isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app (authenticated user)
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/team" element={<Team />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClientInstance}>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </Router>
  )
}

export default App
