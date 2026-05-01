import { FaBell } from 'react-icons/fa';
import {
    HiOutlineChartBar,
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineHome,
    HiOutlinePlusCircle,
    HiOutlineViewGrid,
} from 'react-icons/hi';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Sidebar — dashboard side navigation.
 * Shows different links based on user role.
 */
const Sidebar = () => {
    const { user } = useAuth();
    const isOfficial = user?.role === 'official';
    const isCitizen = user?.role === 'citizen';

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-primary-50 text-primary-700 shadow-sm'
            : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
        }`;

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-surface-200 p-4 min-h-[calc(100vh-4rem)]">
            <div className="space-y-1">
                <NavLink to={isOfficial ? "/government" : "/dashboard"} end className={linkClass}>
                    <HiOutlineViewGrid className="w-5 h-5" />
                    Dashboard
                </NavLink>

                {isCitizen && (
                    <>
                        <NavLink to="/dashboard/create" className={linkClass}>
                            <HiOutlinePlusCircle className="w-5 h-5" />
                            Report Issue
                        </NavLink>
                        <NavLink to="/dashboard/my-tickets" className={linkClass}>
                            <HiOutlineClipboardList className="w-5 h-5" />
                            My Tickets
                        </NavLink>
                        <NavLink to="/dashboard/verify" className={linkClass}>
                            <HiOutlineCheckCircle className="w-5 h-5" />
                            Verify Issues
                        </NavLink>
                    </>
                )}

                {isOfficial && (
                    <>
                        <NavLink to="/government" end className={linkClass}>
                            <HiOutlineChartBar className="w-5 h-5" />
                            Assigned Issues
                        </NavLink>
                    </>
                )}

                <hr className="my-3 border-surface-200" />

                {/* Notifications */}
                <NavLink to="/dashboard/notifications" className={linkClass}>
                    <FaBell className="w-5 h-5" />
                    Notifications
                </NavLink>

                <NavLink to="/" className={linkClass}>
                    <HiOutlineHome className="w-5 h-5" />
                    Home
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
