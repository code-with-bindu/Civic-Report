import { useEffect, useState } from 'react';
import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlinePlusCircle,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import TicketCard from '../components/TicketCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/**
 * Dashboard — user's main dashboard showing summary stats and recent tickets.
 */
const Dashboard = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                console.log('📥 Fetching dashboard tickets with token:', user?.token ? '✅ Present' : '❌ Missing');
                const { data } = await api.get('/tickets/citizen/my-issues', {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });
                console.log('✅ Dashboard API response:', data);
                setTickets(data.data || []);
            } catch (err) {
                console.error('❌ Failed to fetch tickets:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.token) {
            fetchTickets();
            
            // Auto-refresh every 10 seconds to show status updates from government
            const interval = setInterval(fetchTickets, 10000);
            return () => clearInterval(interval);
        }
    }, [user?.token]);

    // Compute stats from tickets
    const stats = {
        total: tickets.length,
        pending: tickets.filter((t) => t.status === 'Pending Verification').length,
        inProgress: tickets.filter((t) => t.status === 'In Progress').length,
        resolved: tickets.filter((t) => t.status === 'Resolved').length,
    };

    const statCards = [
        { label: 'Total Tickets', value: stats.total, icon: HiOutlineClipboardList, color: 'from-primary-500 to-primary-700' },
        { label: 'Pending Verification', value: stats.pending, icon: HiOutlineClock, color: 'from-blue-500 to-cyan-600' },
        { label: 'In Progress', value: stats.inProgress, icon: HiOutlineClock, color: 'from-amber-500 to-orange-600' },
        { label: 'Resolved', value: stats.resolved, icon: HiOutlineCheckCircle, color: 'from-emerald-500 to-green-600' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeInUp">
            {/* Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-800">
                        Welcome, {user?.name} 👋
                    </h1>
                    <p className="text-surface-500 mt-1">Here's an overview of your reported issues.</p>
                </div>
                <Link to="/dashboard/create" className="btn-primary">
                    <HiOutlinePlusCircle className="w-5 h-5 mr-1.5" />
                    Report Issue
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <div key={i} className="card flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md`}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-surface-800">{s.value}</p>
                            <p className="text-xs text-surface-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Tickets */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-surface-800">Recent Tickets</h2>
                    <Link to="/dashboard/my-tickets" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View all →
                    </Link>
                </div>
                {tickets.length === 0 ? (
                    <div className="card text-center py-12">
                        <HiOutlineClipboardList className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                        <p className="text-surface-500">No tickets yet. Start by reporting an issue!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.slice(0, 5).map((ticket) => (
                            <TicketCard key={ticket._id} ticket={ticket} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
