import { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { HiOutlineLogout, HiOutlineShieldCheck, HiOutlineUser } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/**
 * Navbar — top navigation bar with logo, user info, and logout.
 */
const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread notification count
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (user?.token) {
                    const { data } = await api.get('/notifications', {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    });
                    if (data.success) {
                        const unread = data.data.filter((n) => !n.isRead).length;
                        setUnreadCount(unread);
                    }
                }
            } catch (err) {
                // Silently fail - not critical
            }
        };

        fetchNotifications();
        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user?.token]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-surface-200 px-6 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                    C
                </div>
                <span className="text-lg font-bold text-surface-800 hidden sm:block">
                    Civic<span className="text-primary-600">Report</span>
                </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {user && (
                    <>
                        {/* Role badge */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 text-sm">
                            {isAdmin ? (
                                <HiOutlineShieldCheck className="text-primary-600 w-4 h-4" />
                            ) : (
                                <HiOutlineUser className="text-surface-500 w-4 h-4" />
                            )}
                            <span className="font-medium text-surface-700">{user.name}</span>
                            <span className="text-xs text-surface-400 uppercase tracking-wide">
                                {user.role}
                            </span>
                        </div>

                        {/* Notification Bell */}
                        <button
                            onClick={() => navigate('/dashboard/notifications')}
                            className="relative p-2 rounded-lg text-surface-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            title="Notifications"
                        >
                            <FaBell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-surface-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <HiOutlineLogout className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
