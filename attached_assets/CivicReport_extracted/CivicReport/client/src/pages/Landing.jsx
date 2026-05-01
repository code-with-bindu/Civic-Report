import { motion } from 'framer-motion';
import { FaArrowRight, FaMap, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: 'easeOut' },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
            {/* Header */}
            <motion.header className="pt-8 px-4 sm:px-8 text-center">
                <motion.h1
                    className="text-4xl sm:text-5xl font-bold text-purple-900 mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Civic Report
                </motion.h1>
                <motion.p
                    className="text-lg text-gray-600 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Report & track civic issues in your community with transparency and collaboration
                </motion.p>
            </motion.header>

            {/* Main Content */}
            <motion.div
                className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Role Selection Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* Citizen Card */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative"
                        whileHover={{ translateY: -8 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 border border-gray-100">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-purple-900 mb-2">
                                        Citizen
                                    </h2>
                                    <p className="text-gray-600">
                                        Report issues in your community
                                    </p>
                                </div>
                                <div className="text-4xl text-purple-600">
                                    <FaMap />
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8 text-gray-700">
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                                    Report anonymous or verified issues
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                                    Upload photos/videos as evidence
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                                    Verify issues raised by others
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                                    Track resolution status in real-time
                                </li>
                            </ul>

                            <button
                                onClick={() => navigate('/login?role=citizen')}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group"
                            >
                                Sign In as Citizen
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 text-center mb-3">
                                    New to CivicReport?
                                </p>
                                <button
                                    onClick={() => navigate('/register?role=citizen')}
                                    className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 rounded-lg transition-colors duration-200"
                                >
                                    Create Account
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Government Official Card */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative"
                        whileHover={{ translateY: -8 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-200 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 border border-gray-100">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-purple-900 mb-2">
                                        Government Official
                                    </h2>
                                    <p className="text-gray-600">
                                        Manage and resolve civic issues
                                    </p>
                                </div>
                                <div className="text-4xl text-purple-600">
                                    <FaShieldAlt />
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8 text-gray-700">
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                                    View verified community issues
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                                    Assign issues to departments
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                                    Track progress & provide updates
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                                    View analytics & performance metrics
                                </li>
                            </ul>

                            <button
                                onClick={() => navigate('/login?role=official')}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group"
                            >
                                Sign In as Official
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 text-center mb-3">
                                    Government registration required
                                </p>
                                <button
                                    onClick={() => navigate('/register?role=official')}
                                    className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 rounded-lg transition-colors duration-200"
                                >
                                    Register Department
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Continue as Guest */}
                <motion.div
                    variants={itemVariants}
                    className="text-center py-8 border-t border-gray-200"
                >
                    <p className="text-gray-600 mb-4">
                        Want to report anonymously without creating an account?
                    </p>
                    <button
                        onClick={() => navigate('/report-anonymous')}
                        className="text-purple-600 hover:text-purple-700 font-semibold underline transition-colors"
                    >
                        Continue as Guest
                    </button>
                </motion.div>
            </motion.div>

            {/* Features Section */}
            <motion.section
                className="bg-purple-900 text-white py-16 px-4 sm:px-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        className="text-3xl font-bold text-center mb-12"
                        variants={itemVariants}
                    >
                        Why CivicReport?
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div variants={itemVariants} className="text-center">
                            <div className="text-5xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold mb-2">Community-Driven</h3>
                            <p className="text-purple-100">
                                Issues are verified by peers in your community before reaching officials
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="text-center">
                            <div className="text-5xl mb-4">📍</div>
                            <h3 className="text-xl font-bold mb-2">Location-Based</h3>
                            <p className="text-purple-100">
                                GPS tagging and proximity verification ensure accuracy and relevance
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="text-center">
                            <div className="text-5xl mb-4">🔄</div>
                            <h3 className="text-xl font-bold mb-2">Transparent Tracking</h3>
                            <p className="text-purple-100">
                                Real-time updates and status tracking from submission to resolution
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8 px-4 sm:px-8 text-center">
                <p>© 2026 CivicReport. Making cities better, together.</p>
            </footer>
        </div>
    );
}
