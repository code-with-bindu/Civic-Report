import { useEffect, useState } from 'react';
import { FaCalendar, FaCheckCircle, FaClock, FaExclamationTriangle, FaFilter, FaMap, FaSpinner, FaToolbox } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/**
 * GovernmentDashboard — Official dashboard for managing all civic issues
 * Shows all issues (unverified + verified) with status tracking
 */
const GovernmentDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending Verification');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    status: 'In Progress',
    resolvedBy: '',
    progressNote: '',
  });

  const statuses = ['Pending Verification', 'Verified', 'In Progress', 'Resolved', 'Rejected'];

  // Fetch all issues (verified + unverified)
  useEffect(() => {
    const fetchAllIssues = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await api.get('/tickets/government/all-issues', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (data.success) {
          let sorted = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      fetchAllIssues();
    }
  }, [user?.token]);

  // Filter issues by current status
  const filteredIssues = issues.filter((issue) => issue.status === filterStatus);

  // Statistics
  const stats = {
    total: issues.length,
    pendingVerification: issues.filter((i) => i.status === 'Pending Verification').length,
    verified: issues.filter((i) => i.status === 'Verified').length,
    inProgress: issues.filter((i) => i.status === 'In Progress').length,
    resolved: issues.filter((i) => i.status === 'Resolved').length,
    rejected: issues.filter((i) => i.status === 'Rejected').length,
  };

  // Handle assignment
  const handleAssignSubmit = async () => {
    if (!selectedIssue || !assignForm.status) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data } = await api.put(
        `/tickets/${selectedIssue._id}/status`,
        {
          status: assignForm.status,
          resolutionDetails: assignForm.progressNote,
          resolutionDeadline: assignForm.resolvedBy ? new Date(assignForm.resolvedBy).toISOString() : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (data.success) {
        // Update local state
        setIssues(
          issues.map((issue) => (issue._id === selectedIssue._id ? data.data : issue))
        );
        setShowAssignModal(false);
        setSelectedIssue(null);
        alert('Issue updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update issue');
    }
  };

  // Handle mark as completed
  const handleMarkCompleted = async (issueId) => {
    try {
      const { data } = await api.put(
        `/tickets/${issueId}/status`,
        {
          status: 'Resolved',
          resolutionDetails: 'Issue resolved by government official',
          resolutionDeadline: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (data.success) {
        setIssues(issues.map((issue) => (issue._id === issueId ? data.data : issue)));
        alert('Issue marked as completed!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as completed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-surface-900 mb-2">Government Dashboard</h1>
            <p className="text-surface-600">Manage all civic issues and track verification & resolution progress</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card">
            <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
            <p className="text-sm text-surface-600">Total Issues</p>
          </div>
          <div className="card">
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingVerification}</p>
            <p className="text-sm text-surface-600">Pending</p>
          </div>
          <div className="card">
            <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
            <p className="text-sm text-surface-600">Verified</p>
          </div>
          <div className="card">
            <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
            <p className="text-sm text-surface-600">In Progress</p>
          </div>
          <div className="card">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-sm text-surface-600">Resolved</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-200">
        <FaFilter className="text-surface-600" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field px-3 py-2 text-sm"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status} ({issues.filter((i) => i.status === status).length})
            </option>
          ))}
        </select>
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
      {!loading && !error && filteredIssues.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-surface-600">No {filterStatus.toLowerCase()} issues</p>
        </div>
      )}

      {/* Issues Table */}
      {!loading && filteredIssues.length > 0 && (
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <div
              key={issue._id}
              className="card hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Issue Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {issue.isUrgent && (
                      <FaExclamationTriangle className="text-red-500" title="Urgent Issue" />
                    )}
                    <h3 className="text-lg font-bold text-surface-900">{issue.title}</h3>
                  </div>

                  <p className="text-sm text-surface-600 mb-3">{issue.description}</p>

                  {/* Meta Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-surface-600">
                      <FaMap className="text-primary-600" size={14} />
                      <span className="truncate">{issue.location || 'Location not set'}</span>
                    </div>

                    {/* Upvotes */}
                    <div className="flex items-center gap-2 text-surface-600">
                      <span className="font-semibold text-green-600">{issue.verifications?.length || 0}</span>
                      <span>verification{issue.verifications?.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Deadline */}
                    {issue.resolvedBy && (
                      <div className="flex items-center gap-2 text-surface-600">
                        <FaCalendar className="text-blue-600" size={14} />
                        <span>{new Date(issue.resolvedBy).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                    issue.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-700'
                      : issue.status === 'Resolved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {issue.status === 'In Progress' ? <FaToolbox size={14} /> : <FaCheckCircle size={14} />}
                    {issue.status}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => {
                        setSelectedIssue(issue);
                        setAssignForm({
                          status: issue.status,
                          resolvedBy: issue.resolvedBy ? new Date(issue.resolvedBy).toISOString().split('T')[0] : '',
                          progressNote: '',
                        });
                        setShowAssignModal(true);
                      }}
                      className="btn-secondary text-sm flex-1 md:flex-none"
                    >
                      <FaClock size={14} /> Assign
                    </button>

                    {issue.status === 'In Progress' && (
                      <button
                        onClick={() => handleMarkCompleted(issue._id)}
                        className="btn-success text-sm flex-1 md:flex-none"
                      >
                        <FaCheckCircle size={14} /> Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-surface-900 mb-4">Assign Issue</h2>

            <div className="space-y-4">
              {/* Title (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Issue</label>
                <input
                  type="text"
                  value={selectedIssue.title}
                  disabled
                  className="input-field bg-surface-100"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Status</label>
                <select
                  value={assignForm.status}
                  onChange={(e) => setAssignForm({ ...assignForm, status: e.target.value })}
                  className="input-field"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resolved By Date */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Expected Resolution Date</label>
                <input
                  type="date"
                  value={assignForm.resolvedBy}
                  onChange={(e) => setAssignForm({ ...assignForm, resolvedBy: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Progress Note */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Progress Note</label>
                <textarea
                  value={assignForm.progressNote}
                  onChange={(e) => setAssignForm({ ...assignForm, progressNote: e.target.value })}
                  className="input-field h-24"
                  placeholder="Add any notes about the progress..."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="btn-primary flex-1"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentDashboard;
