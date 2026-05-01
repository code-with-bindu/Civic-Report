import { FaCheckCircle, FaCheckDouble, FaClock, FaToolbox } from 'react-icons/fa';

/**
 * StatusTimeline — Visual representation of ticket status progression
 */
const StatusTimeline = ({ status, resolvedBy, verifications = [] }) => {
  const steps = [
    { key: 'Pending Verification', label: 'Pending', icon: FaClock, color: 'yellow' },
    { key: 'Verified', label: 'Verified', icon: FaCheckCircle, color: 'green' },
    { key: 'In Progress', label: 'In Progress', icon: FaToolbox, color: 'blue' },
    { key: 'Resolved', label: 'Completed', icon: FaCheckDouble, color: 'green' },
  ];

  const getStatusIndex = () => {
    return steps.findIndex((step) => step.key === status) || 0;
  };

  const currentIndex = getStatusIndex();

  return (
    <div className="py-4 px-4 bg-surface-50 rounded-lg">
      {/* Timeline */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center">
              {/* Icon */}
              <div
                className={`p-3 rounded-full transition-all ${
                  isCompleted
                    ? `bg-${step.color}-100 text-${step.color}-600`
                    : isCurrent
                    ? `bg-${step.color}-100 text-${step.color}-600 ring-2 ring-${step.color}-300`
                    : 'bg-surface-200 text-surface-500'
                }`}
              >
                <Icon size={18} />
              </div>

              {/* Label */}
              <p className={`text-xs font-semibold mt-2 text-center ${
                isCompleted || isCurrent ? 'text-surface-900' : 'text-surface-500'
              }`}>
                {step.label}
              </p>

              {/* Connector */}
              {idx < steps.length - 1 && (
                <div
                  className={`h-1 w-12 mt-3 rounded-full transition-all ${
                    isCompleted ? 'bg-green-500' : 'bg-surface-300'
                  }`}
                  style={{ marginLeft: '6px' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Status Text & Deadline */}
      <div className="text-center">
        <p className="text-sm font-semibold text-surface-900">
          Status: <span className="text-primary-600">{status}</span>
        </p>
        {resolvedBy && (
          <p className="text-xs text-surface-600 mt-2">
            Expected to be resolved by: <strong>{new Date(resolvedBy).toLocaleDateString()}</strong>
          </p>
        )}
        {verifications && verifications.length > 0 && (
          <p className="text-xs text-green-600 mt-2">
            ✓ {verifications.length} verification{verifications.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatusTimeline;
