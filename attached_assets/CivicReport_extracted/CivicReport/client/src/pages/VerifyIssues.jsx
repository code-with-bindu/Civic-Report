import { useEffect, useState } from 'react';
import { FaArrowLeft, FaFilter, FaMapPin, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/**
 * VerifyIssues — Community verification view where citizens can verify nearby issues
 * Shows issues from other citizens that need community verification and are within proximity
 */
const VerifyIssues = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortBy, setSortBy] = useState('nearest');

    const categories = [
        'All',
        'Pothole',
        'Water Logging',
        'Streetlight',
        'Graffiti',
        'Garbage',
        'Safety',
        'Other',
    ];

    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.warn('Location access denied, showing all issues');
                }
            );
        }
    }, []);

    // Fetch all public issues that need verification
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                setLoading(true);
                setError('');

                const params = {};

                if (categoryFilter !== 'All') {
                    params.category = categoryFilter;
                }

                const { data } = await api.get('/tickets/public/all-issues', {
                    params,
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });

                if (data.success) {
                    let sorted = data.data;

                    // Calculate distance if user location available
                    sorted = sorted.map((issue) => {
                        if (userLocation && issue.gps) {
                            const distance = calculateDistance(
                                userLocation.latitude,
                                userLocation.longitude,
                                issue.gps.latitude,
                                issue.gps.longitude
                            );
                            return { ...issue, distance };
                        }
                        return issue;
                    });

                    // Apply sorting
                    if (sortBy === 'nearest') {
                        sorted.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
                    } else if (sortBy === 'verified') {
                        sorted.sort((a, b) => (b.verifications?.length || 0) - (a.verifications?.length || 0));
                    } else if (sortBy === 'recent') {
                        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    } else if (sortBy === 'urgent') {
                        sorted.sort((a, b) => (b.isUrgent ? 1 : -1));
                    }

                    setIssues(sorted);
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Failed to load issues';
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        if (user?.token) {
            fetchIssues();
        }
    }, [user?.token, categoryFilter]);

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Handle issue verified (callback from IssueCard)
    const handleIssueVerified = (updatedIssue) => {
        // Update verification count or remove from list if now has enough verifications
        setIssues(
            issues.map((issue) => (issue._id === updatedIssue._id ? updatedIssue : issue))
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors font-medium"
                >
                    <FaArrowLeft /> Back to Dashboard
                </button>

                <h1 className="text-4xl font-bold text-surface-900 mb-2">Community Issues</h1>
                <p className="text-surface-600 mb-4">
                    View all civic issues reported by your community. Verify issues you can confirm, and see what problems others have identified. Your verification helps boost authenticity scores and ensures government officials prioritize important problems.
                </p>

                {userLocation && (
                    <div className="flex items-center gap-2 text-sm text-primary-600 bg-primary-50 px-3 py-2 rounded-lg inline-flex">
                        <FaMapPin /> Showing issues near you
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 pb-6 border-b border-surface-200">
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                    <FaFilter className="text-surface-600" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="input-field px-3 py-2 text-sm"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
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
                        {userLocation && <option value="nearest">Nearest to You</option>}
                        <option value="recent">Most Recent</option>
                        <option value="urgent">Most Urgent</option>
                        <option value="verified">Most Verified</option>
                    </select>
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
                    <p className="text-xl text-surface-600 mb-4">
                        No issues to verify {categoryFilter !== 'All' ? `in ${categoryFilter}` : ''}
                    </p>
                    <p className="text-surface-500 mb-6">
                        Great job! All nearby issues have been verified or there are no issues in this category yet.
                    </p>
                </div>
            )}

            {/* Issues Grid */}
            {!loading && issues.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {issues.map((issue) => (
                        <div key={issue._id} className="relative">
                            {/* Distance badge if available */}
                            {issue.distance && (
                                <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                                    {issue.distance.toFixed(1)} km away
                                </div>
                            )}

                            <IssueCard
                                issue={issue}
                                onVerified={handleIssueVerified}
                                showVerifyButton={true}
                                showActions={true}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Help Text */}
            {!loading && issues.length > 0 && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 How Verification Works</h3>
                    <ul className="text-sm text-blue-800 space-y-2">
                        <li>• Click <strong>Verify Issue</strong> if you've seen or experienced the same problem in your area</li>
                        <li>• Your proximity to the issue location influences the verification weight</li>
                        <li>• Issues with 5+ verifications are automatically sent to government officials</li>
                        <li>• Each verified issue helps improve government response times</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default VerifyIssues;
