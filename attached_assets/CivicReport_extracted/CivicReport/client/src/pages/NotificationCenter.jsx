import { useEffect, useState } from 'react';
import { FaBell, FaSpinner, FaTrash } from 'react-icons/fa';
import NotificationItem from '../components/NotificationItem';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/**
 * NotificationCenter — Display and manage all notifications
 */
const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRead, setFilterRead] = useState('all'); // 'all', 'unread', 'read'

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await api.get('/notifications', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (data.success) {
          setNotifications(data.data);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load notifications';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchNotifications();
    }
  }, [user?.token]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const { data } = await api.put(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (data.success) {
        setNotifications(
          notifications.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as read');
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      const { data } = await api.delete(`/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (data.success) {
        setNotifications(notifications.filter((notif) => notif._id !== notificationId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete notification');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const { data } = await api.put(
        '/notifications/read-all',
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (data.success) {
        setNotifications(
          notifications.map((notif) => ({ ...notif, isRead: true }))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark all as read');
    }
  };

  // Delete all notifications
  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;

    try {
      const { data } = await api.delete('/notifications', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (data.success) {
        setNotifications([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete all notifications');
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (filterRead === 'unread') return !notif.isRead;
    if (filterRead === 'read') return notif.isRead;
    return true;
  });

  // Statistics
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary-100">
              <FaBell className="text-primary-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-surface-900">Notifications</h1>
              <p className="text-surface-600">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6 pb-6 border-b border-surface-200">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-surface-600">Filter:</label>
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="input-field px-3 py-2 text-sm"
            >
              <option value="all">All ({notifications.length})</option>
              <option value="unread">Unread ({unreadCount})</option>
              <option value="read">Read ({notifications.length - unreadCount})</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-secondary text-sm"
              >
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="btn-danger text-sm flex items-center gap-2"
              >
                <FaTrash size={14} /> Delete All
              </button>
            )}
          </div>
        </div>
      )}

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
      {!loading && !error && notifications.length === 0 && (
        <div className="text-center py-20">
          <FaBell className="text-6xl text-surface-300 mx-auto mb-4" />
          <p className="text-xl text-surface-600">No notifications yet</p>
          <p className="text-sm text-surface-500 mt-2">
            You'll see updates here when issues are verified or assigned
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!loading && filteredNotifications.length > 0 && (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
            />
          ))}
        </div>
      )}

      {/* No filtered results */}
      {!loading && filteredNotifications.length === 0 && notifications.length > 0 && (
        <div className="text-center py-12">
          <p className="text-surface-600">
            No {filterRead === 'unread' ? 'unread' : filterRead === 'read' ? 'read' : ''}{' '}
            notifications
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
