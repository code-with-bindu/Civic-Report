import { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import {
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineLockClosed,
    HiOutlineMail
} from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login — authentication page for existing users.
 */
const Login = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!form.password) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess('');

        // Validate form
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await login(form.email.trim(), form.password);
            setSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'Login failed. Please try again.';
            setErrors({ submit: errorMessage });
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left — branding panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
                <div className="absolute top-20 left-20 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col justify-center p-16 text-white">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold mb-8">
                        C
                    </div>
                    <h1 className="text-4xl font-extrabold leading-tight mb-4">
                        Welcome Back to<br />CivicReport
                    </h1>
                    <p className="text-primary-200 text-lg max-w-md">
                        Sign in to track your reported issues, view progress updates, and help improve your community.
                    </p>
                </div>
            </div>

            {/* Right — login form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md animate-fadeInUp">
                    {/* Back to Home Button */}
                    <div className="mb-6">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors font-medium"
                        >
                            <FaArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <div className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                            C
                        </div>
                        <h2 className="text-2xl font-bold text-surface-800">Sign In</h2>
                        <p className="text-surface-500 mt-1">Enter your credentials to continue</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                            <HiOutlineCheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Submit Error Message */}
                    {errors.submit && (
                        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                            <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{errors.submit}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Address */}
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-surface-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    className={`input-field pl-10 ${
                                        errors.email ? 'border-red-500 focus:border-red-500' : ''
                                    }`}
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <HiOutlineExclamationCircle className="w-4 h-4" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-surface-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    className={`input-field pl-10 pr-10 ${
                                        errors.password ? 'border-red-500 focus:border-red-500' : ''
                                    }`}
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <HiOutlineExclamationCircle className="w-4 h-4" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className={`btn-primary w-full py-3 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-surface-500">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
