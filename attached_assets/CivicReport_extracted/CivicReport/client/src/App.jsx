import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AdminTickets from './pages/AdminTickets';
import CreateTicket from './pages/CreateTicket';
import Dashboard from './pages/Dashboard';
import EditTicket from './pages/EditTicket';
import GovernmentDashboard from './pages/GovernmentDashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import MyTickets from './pages/MyTickets';
import NotificationCenter from './pages/NotificationCenter';
import Register from './pages/Register';
import ReportAnonymous from './pages/ReportAnonymous';
import TicketDetail from './pages/TicketDetail';
import VerifyIssues from './pages/VerifyIssues';

const App = () => {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/report-anonymous" element={<ReportAnonymous />} />

            {/* User dashboard routes (protected) */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={user?.role === 'official' || user?.role === 'admin' ? <Navigate to="/government" replace /> : <Dashboard />} />
                <Route path="create" element={<CreateTicket />} />
                <Route path="my-tickets" element={<MyTickets />} />
                <Route path="verify" element={<VerifyIssues />} />
                <Route path="ticket/:id" element={<TicketDetail />} />
                <Route path="edit/:id" element={<EditTicket />} />
                <Route path="notifications" element={<NotificationCenter />} />
            </Route>

            {/* Government dashboard routes (protected, official only) */}
            <Route
                path="/government"
                element={
                    <ProtectedRoute requiredRole="official">
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<GovernmentDashboard />} />
                <Route path="tickets" element={<AdminTickets />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
