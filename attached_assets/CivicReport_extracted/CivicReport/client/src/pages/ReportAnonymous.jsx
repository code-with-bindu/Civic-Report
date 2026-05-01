import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCamera, FaCheckCircle, FaMapPin } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ReportAnonymous() {
    const navigate = useNavigate();
    const { generateAnonToken, anonToken } = useAuth();
    
    const [step, setStep] = useState(1); // 1: geo, 2: form, 3: success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Pothole',
        location: '',
        isUrgent: false,
        submitterName: '',
        submitterEmail: '',
        submitterPhone: '',
    });
    
    const [media, setMedia] = useState([]);
    const [submittedTicket, setSubmittedTicket] = useState(null);

    // Categories
    const categories = [
        'Pothole',
        'Water Logging',
        'Streetlight',
        'Graffiti',
        'Garbage',
        'Safety',
        'Other',
    ];

    // Get geolocation on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                    setLocationError('');
                },
                (error) => {
                    setLocationError('Unable to access your location. You can enter it manually.');
                    console.error('Geolocation error:', error);
                }
            );
        }
    }, []);

    // Generate anonymous token when location is available
    useEffect(() => {
        if (location && !anonToken) {
            generateAnonToken(location.latitude, location.longitude);
        }
    }, [location]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        if (media.length + files.length > 5) {
            setError('Maximum 5 files allowed');
            return;
        }
        setMedia([...media, ...files]);
    };

    const removeMedia = (index) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate form
            if (!form.title.trim()) {
                setError('Issue title is required');
                return;
            }
            if (!form.description.trim()) {
                setError('Description is required');
                return;
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('category', form.category);
            formData.append('location', form.location || 'GPS Location');
            formData.append('isAnonymous', true);
            formData.append('isUrgent', form.isUrgent);
            formData.append('submitterName', form.submitterName);
            formData.append('submitterEmail', form.submitterEmail);
            formData.append('submitterPhone', form.submitterPhone);
            formData.append('anonToken', anonToken?.anonToken);

            if (location) {
                formData.append('latitude', location.latitude);
                formData.append('longitude', location.longitude);
            }

            // Add media files
            media.forEach((file) => {
                formData.append('media', file);
            });

            // Submit to API
            const { data } = await api.post('/tickets', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success) {
                setSubmittedTicket(data.data);
                setStep(3);
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || err.message || 'Failed to submit issue';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                    <FaArrowLeft /> Back
                </button>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto p-6">
                {step === 1 && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="text-5xl mb-4">📍</div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            Report an Issue Anonymously
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Help improve your community by reporting civic issues. Your location will be
                            used to verify the issue, but you can stay anonymous.
                        </p>

                        {locationError && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
                                {locationError}
                            </div>
                        )}

                        {location && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 justify-center">
                                <FaCheckCircle /> Location detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                            </div>
                        )}

                        <button
                            onClick={() => setStep(2)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                        >
                            Continue to Form
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-8">Report Details</h1>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Issue Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleFormChange}
                                    placeholder="e.g., Large pothole on Main Street"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleFormChange}
                                    placeholder="Describe the issue in detail..."
                                    rows="5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <FaMapPin /> Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleFormChange}
                                    placeholder="Street address or landmark (optional)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Photo/Video Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <FaCamera /> Evidence (Photo/Video)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={handleMediaChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-sm text-gray-500 mt-1">Max 5 files</p>

                                {/* Media preview */}
                                {media.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        {media.map((file, idx) => (
                                            <div key={idx} className="relative bg-gray-100 rounded-lg p-4">
                                                <p className="text-sm text-gray-600 truncate">{file.name}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedia(idx)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Urgent toggle */}
                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isUrgent"
                                        checked={form.isUrgent}
                                        onChange={handleFormChange}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-gray-700">Mark as urgent</span>
                                </label>
                            </div>

                            {/* Optional Contact Info */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Optional Contact Info</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    (So authorities can follow up if needed)
                                </p>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        name="submitterName"
                                        value={form.submitterName}
                                        onChange={handleFormChange}
                                        placeholder="Your name (optional)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <input
                                        type="email"
                                        name="submitterEmail"
                                        value={form.submitterEmail}
                                        onChange={handleFormChange}
                                        placeholder="Your email (optional)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <input
                                        type="tel"
                                        name="submitterPhone"
                                        value={form.submitterPhone}
                                        onChange={handleFormChange}
                                        placeholder="Your phone (optional)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                                >
                                    {loading ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {step === 3 && submittedTicket && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h1 className="text-3xl font-bold text-green-600 mb-4">
                            Report Submitted Successfully!
                        </h1>
                        <p className="text-gray-600 mb-4">
                            Thank you for reporting this issue. Your report has been submitted and is now
                            awaiting community verification.
                        </p>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6 text-left">
                            <h3 className="font-semibold text-gray-800 mb-3">Report Details</h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p>
                                    <strong>ID:</strong> {submittedTicket._id.slice(0, 8)}...
                                </p>
                                <p>
                                    <strong>Status:</strong>{' '}
                                    <span className="text-yellow-600 font-medium">
                                        {submittedTicket.status}
                                    </span>
                                </p>
                                <p>
                                    <strong>Category:</strong> {submittedTicket.category}
                                </p>
                                <p>
                                    <strong>Verification Progress:</strong> {submittedTicket.verifications.length}/
                                    {submittedTicket.verificationThreshold}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Share the report ID above to allow others to verify your issue.
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                            >
                                Back Home
                            </button>
                            <button
                                onClick={() =>
                                    navigate(
                                        `/register?role=citizen&ref=${submittedTicket._id}`
                                    )
                                }
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
