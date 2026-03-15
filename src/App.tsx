import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SharedStateProvider } from "./lib/shared-storage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminAuthPage from "./pages/AdminAuthPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage";
import ParticipantsPage from "./pages/ParticipantsPage";
import TeamsPage from "./pages/TeamsPage";
import ProjectSubmissionsPage from "./pages/ProjectSubmissionsPage";
import SeatingManagementPage from "./pages/SeatingManagementPage";
import TeamCheckInPage from "./pages/TeamCheckInPage";
import ExpensesPage from "./pages/ExpensesPage";
import LogisticsPage from "./pages/LogisticsPage";
import VolunteersPage from "./pages/VolunteersPage";
import LogsPage from "./pages/LogsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirection logic simplified
const App = () => (
  <QueryClientProvider client={queryClient}>
    <SharedStateProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<AdminAuthPage />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="participants" element={<ParticipantsPage />} />
                <Route path="teams" element={<TeamsPage />} />
                <Route path="project-submissions" element={<ProjectSubmissionsPage />} />
                <Route path="seating" element={<SeatingManagementPage />} />
                <Route path="team-checkin" element={<TeamCheckInPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="logistics" element={<LogisticsPage />} />
                <Route path="volunteers" element={<VolunteersPage />} />
                <Route path="logs" element={<LogsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SharedStateProvider>
  </QueryClientProvider>
);

export default App;
// Triggering HMR to resolve new pages
