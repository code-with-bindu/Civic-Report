/**
 * StatusBadge — a color-coded pill badge for ticket status.
 *
 * @param {string} status — one of: Submitted, In Progress, Resolved, Rejected
 */
const StatusBadge = ({ status }) => {
    const styles = {
        Submitted:
            'bg-blue-100 text-blue-700 border-blue-200',
        'In Progress':
            'bg-amber-100 text-amber-700 border-amber-200',
        Resolved:
            'bg-emerald-100 text-emerald-700 border-emerald-200',
        Rejected:
            'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-surface-100 text-surface-600 border-surface-200'
                }`}
        >
            {status}
        </span>
    );
};

export default StatusBadge;
