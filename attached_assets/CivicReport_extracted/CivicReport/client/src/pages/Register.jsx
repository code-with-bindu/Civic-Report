import { useState } from 'react';
import {
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineLockClosed,
    HiOutlineMail,
    HiOutlineUser,
} from 'react-icons/hi';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Register — signup page for citizens or government officials.
 */
const Register = () => {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') === 'official' ? 'official' : 'citizen';
    
    const [accountType, setAccountType] = useState(initialRole);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!form.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (form.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (form.name.trim().length > 100) {
            newErrors.name = 'Name cannot exceed 100 characters';
        }

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
        } else if (form.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!form.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Department validation for officials
        if (accountType === 'official' && !form.department.trim()) {
            newErrors.department = 'Department is required for official accounts';
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
            await register(
                form.name.trim(), 
                form.email.trim(), 
                form.password, 
                accountType,
                accountType === 'official' ? form.department : undefined
            );
            setSuccess('Account created successfully! Redirecting...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'Registration failed. Please try again.';
            setErrors({ submit: errorMessage });
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left — branding panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 relative overflow-hidden">
                <div className="absolute top-32 left-16 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-16 right-20 w-72 h-72 bg-pink-400/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col justify-center p-16 text-white">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold mb-8">
                        C
                    </div>
                    <h1 className="text-4xl font-extrabold leading-tight mb-4">
                        Join CivicReport
                    </h1>
                    <p className="text-purple-200 text-lg max-w-md">
                        {accountType === 'citizen' 
                            ? 'Report issues and help improve your community with transparency and verification.'
                            : 'Manage and resolve civic issues from your organization.'}
                    </p>
                </div>
            </div>

            {/* Right — register form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Back to Home Button */}
                    <div className="mb-6">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors font-medium"
                        >
                            <FaArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <div className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                            C
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                        <p className="text-gray-600 mt-1">Join as {accountType === 'citizen' ? 'a Citizen' : 'a Government Official'}</p>
                    </div>

                    {/* Account Type Toggle */}
                    <div className="flex gap-4 mb-8">
                        {[
                            { id: 'citizen', label: 'Citizen', icon: '👤' },
                            { id: 'official', label: 'Official', icon: '🏛️' },
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    setAccountType(type.id);
                                    setErrors({});
                                }}
                                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                                    accountType === type.id
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <span className="mr-2">{type.icon}</span>{type.label}
                            </button>
                        ))}
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="register-name"
                                    type="text"
                                    name="name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                        errors.name ? 'border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    placeholder="John Doe"
                                    disabled={loading}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <HiOutlineExclamationCircle className="w-4 h-4" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email Address */}
                        <div>
                            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="register-email"
                                    type="email"
                                    name="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                        errors.email ? 'border-red-500 focus:ring-red-500' : ''
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

                        {/* Department (for officials only) */}
                        {accountType === 'official' && (
                            <div>
                                <label htmlFor="register-department" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Department / Organization
                                </label>
                                <input
                                    id="register-department"
                                    type="text"
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                        errors.department ? 'border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    placeholder="e.g., Public Works Department"
                                    disabled={loading}
                                />
                                {errors.department && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <HiOutlineExclamationCircle className="w-4 h-4" />
                                        {errors.department}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="register-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    minLength={6}
                                    value={form.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                        errors.password ? 'border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    placeholder="Min. 6 characters"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
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

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="register-confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    required
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                        errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    placeholder="Re-enter password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <HiOutlineExclamationCircle className="w-4 h-4" />
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Creating account...</span>
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-600 font-medium hover:text-purple-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
