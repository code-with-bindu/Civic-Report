import { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaSpinner
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/**
 * TicketDetail — Full detailed view of a civic issue with timeline, media, and interactions
 */
const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    // Status styling
    const statusColors = {
        'Pending Verification': 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'Verified': 'bg-green-100 text-green-800 border-green-300',
        'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
        'Resolved': 'bg-green-100 text-green-800 border-green-300',
        'Rejected': 'bg-red-100 text-red-800 border-red-300',
    };

    const statusIcons = {
        'Pending Verification': <FaClock className="text-yellow-600" />,
        'Verified': <FaCheckCircle className="text-green-600" />,
        'In Progress': <FaClock className="text-blue-600" />,
        'Resolved': <FaCheckCircle className="text-green-600" />,
        'Rejected': <FaExclamationTriangle className="text-red-600" />,
    };

    // Fetch issue details
    useEffect(() => {
        const fetchIssue = async () => {
            try {
                setLoading(true);
                setError('');

                const { data } = await api.get(`/tickets/${id}`, {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });

                if (data.success) {
                    setIssue(data.data);
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Failed to load issue details';
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchIssue();
        }
    }, [id, user?.token]);

    // Handle verification
    const handleVerify = async () => {
        try {
            setVerificationError('');
            setVerifying(true);

            const { data } = await api.post(`/tickets/${id}/verify`, {
                confirmedLocation: true,
            });

            if (data.success) {
                setIssue(data.data);
                window.dispatchEvent(
                    new CustomEvent('toast', {
                        detail: { message: '✓ You verified this issue!', type: 'success' },
                    })
                );
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to verify issue';
            setVerificationError(errorMsg);
        } finally {
            setVerifying(false);
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
                >
                    <FaArrowLeft /> Back
                </button>
                <div className="flex items-center justify-center py-20">
                    <FaSpinner className="text-4xl text-primary-600 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
                >
                    <FaArrowLeft /> Back
                </button>
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                    {error || 'Issue not found'}
                </div>
            </div>
        );
    }


    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors"
            >
                <FaArrowLeft /> Back
            </button>

            {/* Header */}
            <div className="card mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-surface-900 mb-3">{issue.title}</h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span
                                className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 border ${statusColors[issue.status]}`}
                            >
                                {statusIcons[issue.status]}
                                {issue.status}
                            </span>
                            <span className="text-sm text-surface-500 flex items-center gap-1">
                                <FaTags /> {issue.category}
                            </span>
                            {issue.isUrgent && (
                                <span className="text-sm text-red-600 flex items-center gap-1 font-semibold">
                                    <FaExclamationTriangle /> Urgent
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meta Information */}
                <div className="space-y-2 text-sm text-surface-600 border-t border-surface-200 pt-4">
                    <div className="flex items-center gap-2">
                        <FaUser className="text-primary-600 w-4" />
                        {issue.isAnonymous ? 'Anonymous Submission' : (
                            <>
                                <strong>{issue.submitterName || 'Citizen'}</strong>
                                {!issue.isAnonymous && issue.submitterEmail && (
                                    <span className="text-xs">{issue.submitterEmail}</span>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaCalendar className="text-primary-600 w-4" />
                        Reported on {formatDate(issue.createdAt)}
                    </div>
                    {issue.manualLocation && (
                        <div className="flex items-center gap-2">
                            <FaMapPin className="text-primary-600 w-4" />
                            {issue.manualLocation}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Description & Location */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                            <FaFileAlt /> Description
                        </h2>
                        <p className="text-surface-700 whitespace-pre-wrap">{issue.description}</p>
                    </div>

                    {/* Location Map */}
                    {issue.gps && (
                        <div className="card">
                            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                                <FaMapPin /> Location
                            </h2>
                            <div className="h-80 rounded-lg overflow-hidden">
                                <LocationMap
                                    location={{
                                        latitude: issue.gps.latitude,
                                        longitude: issue.gps.longitude,
                                    }}
                                    editable={false}
                                />
                            </div>
                        </div>
                    )}

                    {/* Media */}
                    {issue.media && issue.media.length > 0 && (
                        <div className="card">
                            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                                <FaImage /> Evidence ({issue.media.length})
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {issue.media.map((mediaUrl, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-surface-100 rounded-lg overflow-hidden aspect-square"
                                    >
                                        {mediaUrl.includes('video') || mediaUrl.endsWith('.mp4') ? (
                                            <video
                                                src={mediaUrl}
                                                controls
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={mediaUrl}
                                                alt={`Evidence ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress Notes */}
                    {issue.progressNotes && issue.progressNotes.length > 0 && (
                        <div className="card">
                            <h2 className="text-lg font-bold text-surface-900 mb-4">Updates</h2>
                            <div className="space-y-4">
                                {issue.progressNotes.map((note, idx) => (
                                    <div
                                        key={idx}
                                        className="border-l-4 border-primary-600 pl-4 py-2"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-semibold text-surface-800">
                                                {note.department || 'System'}
                                            </p>
                                            <span className="text-xs text-surface-500">
                                                {formatDate(note.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-surface-700">{note.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Verification & Actions */}
                <div className="lg:col-span-1">
                    {/* Verification Box */}
                    <div className="card sticky top-4 mb-6">
                        <h2 className="text-lg font-bold text-surface-900 mb-4">Authenticity Score</h2>

                        <div className="space-y-4">
                            {/* Score Display */}
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary-600 mb-1">
                                    {issue.verifications?.length || 0}
                                </p>
                                <p className="text-sm text-surface-600">Confirmations</p>
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-surface-700">
                                        Progress to Verified
                                    </span>
                                    <span className="text-sm font-bold text-primary-600">
                                        {verificationPercent.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-surface-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${verificationPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-surface-500 mt-2">
                                    {verificationPercent < 100 ? (
                                        <>Needs {5 - (issue.verifications?.length || 0)} more confirmations</>
                                    ) : (
                                        <>Ready for government officials</>
                                    )}
                                </p>
                            </div>

                            {/* Verification Error */}
                            {verificationError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
                                    {verificationError}
                                </div>
                            )}

                            {/* Verify Button */}
                            <button
                                onClick={handleVerify}
                                disabled={verifying}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                <FaThumbsUp /> {verifying ? 'Verifying...' : 'I Can Confirm This'}
                            </button>

                            {/* Status Badge */}
                            <div
                                className={`p-3 rounded-lg text-center text-sm font-medium border ${statusColors[issue.status]}`}
                            >
                                {issue.status === 'Resolved' && '✅ This issue has been resolved'}
                                {issue.status === 'Rejected' && '❌ This issue was not verified'}
                                {issue.status === 'In Progress' && '🔧 The government is working on this'}
                                {issue.status === 'Verified' && '✓ Ready for government review'}
                                {issue.status === 'Pending Verification' && 'Help verify this issue'}
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="card">
                        <h3 className="font-semibold text-surface-900 mb-3">Details</h3>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="font-medium text-surface-700">Category</dt>
                                <dd className="text-surface-600">{issue.category}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-surface-700">Urgency</dt>
                                <dd className="text-surface-600">
                                    {issue.isUrgent ? '🔴 High' : '🟡 Normal'}
                                </dd>
                            </div>
                            {issue.assignedDepartment && (
                                <div>
                                    <dt className="font-medium text-surface-700">Assigned To</dt>
                                    <dd className="text-surface-600">{issue.assignedDepartment}</dd>
                                </div>
                            )}
                            {issue.resolutionDeadline && (
                                <div>
                                    <dt className="font-medium text-surface-700">Target Resolution</dt>
                                    <dd className="text-surface-600">
                                        {formatDate(issue.resolutionDeadline)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
