import { useEffect, useState } from 'react';
import { FaArrowLeft, FaFilter, FaPlus, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/**
 * MyTickets — Citizen dashboard showing their submitted issues with filters and status tracking
 */
const MyTickets = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('recent');
    const [showAllReports, setShowAllReports] = useState(false); // Toggle between My Reports and All Community Reports

    const statuses = ['All', 'Pending Verification', 'Verified', 'In Progress', 'Resolved', 'Rejected'];

    // Fetch issues (either user's or all community reports)
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                setLoading(true);
                setError('');

                const endpoint = showAllReports ? '/tickets/public/all-issues' : '/tickets/citizen/my-issues';
                console.log(`📥 Fetching from ${endpoint} with token:`, user.token ? '✅ Present' : '❌ Missing');
                const { data } = await api.get(endpoint, {
                    params: {
                        status: statusFilter !== 'All' ? statusFilter : undefined,
                    },
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                console.log(`✅ API response for ${endpoint}:`, data);

                if (data.success) {
                    let sorted = data.data;
                    console.log(`📊 Found ${sorted.length} issues`);

                    // Apply sorting
                    if (sortBy === 'recent') {
                        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    } else if (sortBy === 'oldest') {
                        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    } else if (sortBy === 'urgent') {
                        sorted.sort((a, b) => (b.isUrgent ? 1 : -1));
                    } else if (sortBy === 'verified') {
                        sorted.sort((a, b) => (b.verifications?.length || 0) - (a.verifications?.length || 0));
                    }

                    setIssues(sorted);
                } else {
                    console.error('❌ API returned success:false', data);
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Failed to load issues';
                console.error('❌ Fetch error:', err);
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        if (user?.token) {
            fetchIssues();
        }
    }, [user?.token, statusFilter, showAllReports]);

    // Handle issue verified/updated
    const handleIssueUpdate = (updatedIssue) => {
        setIssues(issues.map((issue) => (issue._id === updatedIssue._id ? updatedIssue : issue)));
    };

    // Statistics
    const stats = {
        total: issues.length,
        pending: issues.filter((i) => i.status === 'Pending Verification').length,
        verified: issues.filter((i) => i.status === 'Verified').length,
        inProgress: issues.filter((i) => i.status === 'In Progress').length,
        resolved: issues.filter((i) => i.status === 'Resolved').length,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors font-medium"
            >
                <FaArrowLeft /> Back to Dashboard
            </button>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-surface-900 mb-2">{showAllReports ? 'Community Reports' : 'My Reports'}</h1>
                        <p className="text-surface-600">{showAllReports ? 'View and verify issues reported by all citizens in your community' : 'Track your civic issue submissions and verification status'}</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/create')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <FaPlus /> New Report
                    </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="card">
                        <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
                        <p className="text-sm text-surface-600">Total Reports</p>
                    </div>
                    <div className="card">
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        <p className="text-sm text-surface-600">Pending</p>
                    </div>
                    <div className="card">
                        <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                        <p className="text-sm text-surface-600">Verified</p>
                    </div>
                    <div className="card">
                        <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                        <p className="text-sm text-surface-600">In Progress</p>
                    </div>
                    <div className="card">
                        <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
                        <p className="text-sm text-surface-600">Resolved</p>
                    </div>
                </div>
            </div>

            {/* Toggle My Reports vs All Reports */}
            <div className="mb-6 flex items-center gap-2 bg-surface-50 p-2 rounded-lg w-fit">
                <button
                    onClick={() => setShowAllReports(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        !showAllReports
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-surface-600 hover:bg-surface-100'
                    }`}
                >
                    My Reports
                </button>
                <button
                    onClick={() => setShowAllReports(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        showAllReports
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-surface-600 hover:bg-surface-100'
                    }`}
                >
                    All Community Reports
                </button>
            </div>

            {/* Filters & View Mode */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 pb-6 border-b border-surface-200">
                {/* Filter */}
                <div className="flex items-center gap-2">
                    <FaFilter className="text-surface-600" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field px-3 py-2 text-sm"
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-surface-600">Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input-field px-3 py-2 text-sm"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest</option>
                        <option value="urgent">Most Urgent</option>
                        <option value="verified">Most Verified</option>
                    </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-2 rounded-lg transition-all ${
                            viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-700'
                        }`}
                    >
                        Grid
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 rounded-lg transition-all ${
                            viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-700'
                        }`}
                    >
                        List
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <FaSpinner className="text-4xl text-primary-600 animate-spin" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && issues.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-xl text-surface-600 mb-6">No reports found</p>
                    <button
                        onClick={() => navigate('/dashboard/create')}
                        className="btn-primary"
                    >
                        Submit Your First Report
                    </button>
                </div>
            )}

            {/* Issues Grid */}
            {!loading && issues.length > 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issues.map((issue) => (
                        <IssueCard
                            key={issue._id}
                            issue={issue}
                            compact={true}
                            onVerified={handleIssueUpdate}
                        />
                    ))}
                </div>
            )}

            {/* Issues List */}
            {!loading && issues.length > 0 && viewMode === 'list' && (
                <div className="space-y-4">
                    {issues.map((issue) => (
                        <IssueCard
                            key={issue._id}
                            issue={issue}
                            compact={true}
                            onVerified={handleIssueUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTickets;
