import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import {
    HiOutlineLocationMarker,
    HiOutlineCalendar,
    HiOutlinePhotograph,
} from 'react-icons/hi';

/**
 * TicketCard — summary card for a ticket in list views.
 */
const TicketCard = ({ ticket }) => {
    const categoryColors = {
        Road: 'from-orange-400 to-red-500',
        Water: 'from-cyan-400 to-blue-500',
        Electricity: 'from-yellow-400 to-amber-500',
        Garbage: 'from-green-400 to-emerald-500',
        Other: 'from-purple-400 to-indigo-500',
    };

    return (
        <Link
            to={`/dashboard/ticket/${ticket._id}`}
            className="card group cursor-pointer animate-fadeInUp"
        >
            <div className="flex items-start justify-between gap-4">
                {/* Category indicator + title */}
                <div className="flex items-start gap-3 min-w-0">
                    <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryColors[ticket.category] || categoryColors.Other
                            } flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}
                    >
                        {ticket.category?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-surface-800 group-hover:text-primary-600 transition-colors truncate">
                            {ticket.title}
                        </h3>
                        <p className="text-sm text-surface-500 mt-0.5 line-clamp-2">
                            {ticket.description}
                        </p>
                    </div>
                </div>

                {/* Status */}
                <StatusBadge status={ticket.status} />
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 mt-4 text-xs text-surface-400">
                <span className="flex items-center gap-1">
                    <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                    {ticket.location}
                </span>
                <span className="flex items-center gap-1">
                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
                {ticket.media?.length > 0 && (
                    <span className="flex items-center gap-1">
                        <HiOutlinePhotograph className="w-3.5 h-3.5" />
                        {ticket.media.length} file{ticket.media.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>
        </Link>
    );
};

export default TicketCard;
