import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChickenProduction from './pages/ChickenProduction';
import SauceTracker from './pages/SauceTracker';
import NotesAlerts from './pages/NotesAlerts';
import TaskManagement from './pages/TaskManagement';
import DailyShifts from './pages/DailyShifts';
import WeeklyRoster from './pages/WeeklyRoster';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="chicken-production" element={<ChickenProduction />} />
        <Route path="sauce-tracker" element={<SauceTracker />} />
        <Route path="notes-alerts" element={<NotesAlerts />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="daily-shifts" element={<DailyShifts />} />
        <Route path="weekly-roster" element={<WeeklyRoster />} />
      </Route>
    </Routes>
  );
}

export default App;