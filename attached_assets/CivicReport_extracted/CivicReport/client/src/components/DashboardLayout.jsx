import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * DashboardLayout — wraps dashboard pages with Navbar + Sidebar + scrollable content area.
 */
const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-surface-50">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
