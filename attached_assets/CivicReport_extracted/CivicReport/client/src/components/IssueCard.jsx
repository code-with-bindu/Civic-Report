import { useState } from 'react';
import { FaCalendar, FaCheckCircle, FaClock, FaExclamationTriangle, FaImage, FaMapPin, FaTags, FaThumbsUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

/**
 * IssueCard — Reusable component for displaying civic issues with verification/voting UI
 * Used in both community verification view and citizen dashboard
 */
const IssueCard = ({ issue, onVerified, compact = false, showActions = true, showVerifyButton = false }) => {
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    // Status badge styling
    const statusColors = {
        'Pending Verification': 'bg-yellow-100 text-yellow-800',
        'Verified': 'bg-green-100 text-green-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Resolved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
    };

    const statusIcons = {
        'Pending Verification': <FaClock className="text-yellow-600" />,
        'Verified': <FaCheckCircle className="text-green-600" />,
        'In Progress': <FaClock className="text-blue-600" />,
        'Resolved': <FaCheckCircle className="text-green-600" />,
        'Rejected': <FaExclamationTriangle className="text-red-600" />,
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get submitter name (either from createdBy or submitterName for anonymous)
    const getSubmitterName = () => {
        if (issue.createdBy?.name) {
            return issue.createdBy.name;
        } else if (issue.submitterName) {
            return `${issue.submitterName} (Anonymous)`;
        } else if (issue.isAnonymous) {
            return 'Anonymous User';
        }
        return 'Unknown';
    };

    // Calculate verification progress percentage
    const verificationPercent = Math.min(
        (issue.verifications?.length || 0) / 5 * 100,
        100
    );

    // Handle verification/upvote
    const handleVerify = async () => {
        try {
            setVerificationError('');
            setVerifying(true);

            const { data } = await api.post(`/tickets/${issue._id}/verify`, {
                confirmedLocation: true,
            });

            if (data.success) {
                // Update parent component if callback provided
                if (onVerified) {
                    onVerified(data.data);
                }
                // Show success toast
                const event = new CustomEvent('toast', {
                    detail: { message: '✓ You verified this issue!', type: 'success' },
                });
                window.dispatchEvent(event);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to verify issue';
            setVerificationError(errorMsg);
        } finally {
            setVerifying(false);
        }
    };

    if (compact) {
        // Minimal card for lists/grids
        return (
            <div
                onClick={() => navigate(`/dashboard/ticket/${issue._id}`)}
                className="card cursor-pointer transform hover:scale-105 transition-transform"
            >
                <div className="flex items-start gap-3">
                    {/* Category badge */}
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FaTags className="text-primary-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-surface-900 truncate">{issue.title}</h3>
                        <p className="text-sm text-surface-500 mt-1">{issue.category} • Reported by {getSubmitterName()}</p>

                        {/* Status & Date */}
                        <div className="flex items-center gap-2 mt-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[issue.status]}`}>
                                {statusIcons[issue.status]}
                                {issue.status}
                            </span>
                            <span className="text-xs text-surface-500 flex items-center gap-1">
                                <FaCalendar /> {formatDate(issue.createdAt)}
                            </span>
                        </div>
                    </div>

                    {/* Authenticity Score */}
                    <div className="flex-shrink-0 text-right">
                        <p className="text-2xl font-bold text-primary-600">{issue.verifications?.length || 0}</p>
                        <p className="text-xs text-surface-500">Verified</p>
                    </div>
                </div>
            </div>
        );
    }

    // Full card for detailed view
    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-surface-900 mb-2">{issue.title}</h2>
                    <p className="text-sm text-surface-600 mb-3">Reported by <span className="font-semibold">{getSubmitterName()}</span></p>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusColors[issue.status]}`}>
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

            {/* Description */}
            <p className="text-surface-700 mb-4 line-clamp-2">{issue.description}</p>

            {/* Location & Date */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-surface-200">
                <div className="flex items-center gap-2 text-sm text-surface-600">
                    <FaMapPin className="text-primary-600" />
                    {issue.manualLocation || 'GPS Location'}
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-600">
                    <FaCalendar className="text-primary-600" />
                    {formatDate(issue.createdAt)}
                </div>
            </div>

            {/* Media count */}
            {issue.media && issue.media.length > 0 && (
                <div className="flex items-center gap-2 mb-4 text-sm text-surface-600">
                    <FaImage /> {issue.media.length} photo{issue.media.length !== 1 ? 's' : ''}
                </div>
            )}

            {/* Verification Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-700">Authenticity Score</span>
                    <span className="text-lg font-bold text-primary-600">
                        {issue.verifications?.length || 0}/{5}
                    </span>
                </div>
                <div className="w-full bg-surface-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${verificationPercent}%` }}
                    />
                </div>
                <p className="text-xs text-surface-500 mt-2">
                    {verificationPercent < 100 ? (
                        <>Needs {5 - (issue.verifications?.length || 0)} more verifications to be sent to officials</>
                    ) : (
                        <>Ready for government review</>
                    )}
                </p>
            </div>

            {/* Verification Error */}
            {verificationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
                    {verificationError}
                </div>
            )}

            {/* Actions */}
            {showActions && (
                <div className="flex gap-3">
                    {showVerifyButton && (
                        <button
                            onClick={handleVerify}
                            disabled={verifying}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            <FaThumbsUp /> {verifying ? 'Verifying...' : 'Verify Issue'}
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/dashboard/ticket/${issue._id}`)}
                        className="btn-secondary flex-1"
                    >
                        View Details
                    </button>
                </div>
            )}
        </div>
    );
};

export default IssueCard;
