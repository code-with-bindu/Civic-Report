import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/tickets/admin/analytics');
                setAnalytics(data.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600" /></div>;
    if (!analytics) return <div className="card text-center py-12 text-red-600">Failed to load analytics.</div>;

    const statCards = [
        { label: 'Total', value: analytics.total, icon: HiOutlineClipboardList, color: 'from-primary-500 to-primary-700', bg: 'bg-primary-50' },
        { label: 'Submitted', value: analytics.submitted, icon: HiOutlineClock, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50' },
        { label: 'In Progress', value: analytics.inProgress, icon: HiOutlineClock, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50' },
        { label: 'Resolved', value: analytics.resolved, icon: HiOutlineCheckCircle, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50' },
        { label: 'Rejected', value: analytics.rejected, icon: HiOutlineXCircle, color: 'from-red-500 to-rose-600', bg: 'bg-red-50' },
    ];

    const categories = Object.entries(analytics.byCategory || {});
    const maxCat = Math.max(...categories.map(([, v]) => v), 1);
    const catColors = { Road: 'bg-orange-500', Water: 'bg-cyan-500', Electricity: 'bg-yellow-500', Garbage: 'bg-green-500', Other: 'bg-purple-500' };

    return (
        <div className="space-y-8 animate-fadeInUp">
            <div>
                <h1 className="text-2xl font-bold text-surface-800">Admin Dashboard</h1>
                <p className="text-surface-500 mt-1">Welcome back, {user?.name}. Here&apos;s an overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((s, i) => (
                    <div key={i} className="card flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md mb-3`}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-bold text-surface-800">{s.value}</p>
                        <p className="text-xs text-surface-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Category Distribution Chart */}
            <div className="card">
                <h2 className="font-semibold text-surface-800 mb-4">Category Distribution</h2>
                {categories.length === 0 ? (
                    <p className="text-surface-500 text-sm">No data available yet.</p>
                ) : (
                    <div className="space-y-3">
                        {categories.map(([name, count]) => (
                            <div key={name} className="flex items-center gap-3">
                                <span className="w-24 text-sm font-medium text-surface-700 text-right">{name}</span>
                                <div className="flex-1 h-8 bg-surface-100 rounded-lg overflow-hidden">
                                    <div className={`h-full ${catColors[name] || 'bg-primary-500'} rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-2`} style={{ width: `${(count / maxCat) * 100}%` }}>
                                        <span className="text-xs font-bold text-white">{count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
