import { FaBell, FaCheckCircle, FaExclamationTriangle, FaToolbox } from 'react-icons/fa';

/**
 * NotificationItem — Individual notification display with read/unread status
 */
const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'verification':
        return <FaCheckCircle className="text-green-600" size={20} />;
      case 'assignment':
        return <FaToolbox className="text-blue-600" size={20} />;
      case 'status_update':
        return <FaExclamationTriangle className="text-yellow-600" size={20} />;
      default:
        return <FaBell className="text-primary-600" size={20} />;
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case 'verification':
        return 'Issue Verified';
      case 'assignment':
        return 'Issue Assigned';
      case 'status_update':
        return 'Status Updated';
      default:
        return 'Notification';
    }
  };

  return (
    <div
      className={`flex gap-4 p-4 rounded-lg border-l-4 transition-all ${
        notification.isRead
          ? 'bg-surface-50 border-surface-300'
          : 'bg-primary-50 border-primary-500 shadow-sm'
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-semibold text-surface-900">
              {notification.title}
            </p>
            <p className="text-sm text-surface-600 mt-1">
              {notification.message}
            </p>

            {notification.relatedTicket && (
              <div className="mt-2 p-2 bg-white rounded border border-surface-200">
                <p className="text-xs text-surface-700">
                  <strong>Issue:</strong> {notification.relatedTicket}
                </p>
              </div>
            )}

            <p className="text-xs text-surface-500 mt-2">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Badge */}
          {!notification.isRead && (
            <div className="flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification._id)}
              className="text-xs px-3 py-1 rounded bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors font-medium"
            >
              Mark as Read
            </button>
          )}
          <button
            onClick={() => onDelete(notification._id)}
            className="text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
