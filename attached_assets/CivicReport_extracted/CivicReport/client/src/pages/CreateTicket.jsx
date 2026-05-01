import { useEffect, useState } from 'react';
import { FaCamera, FaCheckCircle, FaExclamationTriangle, FaMapPin, FaTimes, FaWifi } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LocationMap from '../components/LocationMap';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import api from '../utils/api';
import { savePendingIssue } from '../utils/db';

/**
 * CreateTicket — enhanced multi-step form for reporting civic issues with geolocation.
 * Supports offline submission with IndexedDB.
 */
const CreateTicket = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { location, getLocation, loading: geoLoading } = useGeolocation();

    const [step, setStep] = useState(1); // 1: geo, 2: form, 3: preview, 4: success
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Pothole',
        manualLocation: '',
        isUrgent: false,
    });

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [media, setMedia] = useState([]);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const categories = [
        'Pothole',
        'Water Logging',
        'Streetlight',
        'Graffiti',
        'Garbage',
        'Safety',
        'Other',
    ];

    // Auto-fetch geolocation on mount
    useEffect(() => {
        getLocation();
    }, []);

    // Detect online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Use detected location if available
    useEffect(() => {
        if (location) {
            setSelectedLocation(location);
        }
    }, [location]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        if (media.length + files.length > 5) {
            setErrors({ media: 'Maximum 5 files allowed' });
            return;
        }
        setMedia([...media, ...files]);
    };

    const removeMedia = (index) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.title.trim()) {
            newErrors.title = 'Issue title is required';
        }
        if (!form.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!selectedLocation && !form.manualLocation) {
            newErrors.location = 'Location is required (either GPS or manual)';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('category', form.category);
            formData.append('location', form.manualLocation || 'GPS Location');
            formData.append('isUrgent', form.isUrgent);

            if (selectedLocation) {
                formData.append('latitude', selectedLocation.latitude);
                formData.append('longitude', selectedLocation.longitude);
            }

            media.forEach((file) => {
                formData.append('media', file);
            });

            // If online, submit directly
            if (isOnline) {
                console.log('📤 Submitting ticket with token:', user.token ? '✅ Present' : '❌ Missing');
                const { data } = await api.post('/tickets', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                console.log('✅ Ticket created:', data);
                if (data.success) {
                    setSuccessData(data.data);
                    setStep(4);
                } else {
                    console.error('❌ API returned success:false', data);
                    setGeneralError('Failed to create ticket');
                }
            } else {
                // If offline, save to IndexedDB
                await savePendingIssue({
                    title: form.title,
                    description: form.description,
                    category: form.category,
                    location: form.manualLocation || 'GPS Location',
                    isUrgent: form.isUrgent,
                    latitude: selectedLocation?.latitude,
                    longitude: selectedLocation?.longitude,
                    media: media,
                });

                setSuccessData({
                    _id: `offline-${Date.now()}`,
                    title: form.title,
                    offline: true,
                });
                setStep(4);
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || err.message || 'Failed to submit issue';
            setGeneralError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Report a Civic Issue</h1>
                <p className="text-gray-600">Help improve your community by reporting issues</p>
            </div>

            {/* Offline Notice */}
            {!isOnline && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <FaSignal className="animate-pulse" />
                    You're offline. Your issue will be saved locally and submitted when you're back online.
                </div>
            )}

            {/* Online Status */}
            {isOnline && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <FaWifi /> Online - Ready to submit
                </div>
            )}

            {/* Step Indicator */}
            <div className="flex gap-4 mb-8">
                {[1, 2, 3, 4].map((s) => (
                    <div
                        key={s}
                        className={`flex-1 h-2 rounded-full ${
                            s <= step ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                    />
                ))}
            </div>

            {/* Step 1: Geolocation */}
            {step === 1 && (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaMapPin /> Select Location
                    </h2>

                    {geoLoading && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin" />
                            Getting your location...
                        </div>
                    )}

                    {location && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                            <FaCheckCircle /> Location detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </div>
                    )}

                    {selectedLocation && (
                        <div className="mb-6 h-80">
                            <LocationMap location={selectedLocation} onLocationSelect={setSelectedLocation} editable={true} />
                        </div>
                    )}

                    {!selectedLocation && !geoLoading && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                            <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">Geolocation not available</p>
                                <p className="text-sm">You can enter the location manually in the next step.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setStep(2)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Form Details */}
            {step === 2 && (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Issue Details</h2>

                    {generalError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                            <FaTimes className="flex-shrink-0 mt-0.5" />
                            <span>{generalError}</span>
                        </div>
                    )}

                    <form className="space-y-6">
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
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                                    errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
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
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                placeholder="Provide detailed information about the issue..."
                                rows="5"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Manual Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location Details (Street/Landmark)
                            </label>
                            <input
                                type="text"
                                name="manualLocation"
                                value={form.manualLocation}
                                onChange={handleFormChange}
                                placeholder="e.g., Main Street near City Hall"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            {selectedLocation && (
                                <p className="text-sm text-green-600 mt-1">
                                    ✓ GPS coordinates captured
                                </p>
                            )}
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
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">Max 5 files</p>

                            {media.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    {media.map((file, idx) => (
                                        <div key={idx} className="relative bg-gray-100 rounded-lg p-4">
                                            <p className="text-sm text-gray-600 truncate">{file.name}</p>
                                            <button
                                                type="button"
                                                onClick={() => removeMedia(idx)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Urgent toggle */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="urgent"
                                name="isUrgent"
                                checked={form.isUrgent}
                                onChange={handleFormChange}
                                className="w-4 h-4 text-purple-600"
                            />
                            <label htmlFor="urgent" className="text-sm text-gray-700">
                                Mark as urgent (high priority)
                            </label>
                        </div>
                    </form>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Review
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Your Report</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Title</h3>
                            <p className="text-gray-600">{form.title}</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Category</h3>
                            <p className="text-gray-600">{form.category}</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{form.description}</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                            <p className="text-gray-600">
                                {form.manualLocation || 'GPS Location'}
                                {selectedLocation && `  (${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)})`}
                            </p>
                        </div>

                        {media.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Evidence ({media.length} files)</h3>
                                <ul className="text-sm text-gray-600">
                                    {media.map((file, idx) => (
                                        <li key={idx}>• {file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {form.isUrgent && (
                            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg">
                                ⚠️ Marked as urgent
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => setStep(2)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && successData && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-3xl font-bold text-green-600 mb-4">
                        {successData.offline ? 'Report Saved Offline!' : 'Report Submitted!'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {successData.offline
                            ? 'Your report has been saved locally. It will be submitted automatically when you go back online.'
                            : 'Your civic issue has been submitted successfully. It will appear on the community dashboard for verification.'}
                    </p>

                    {successData.offline && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-yellow-800 text-sm font-medium">
                                💾 Offline Mode: Your report is stored locally and will sync when your connection is restored.
                            </p>
                        </div>
                    )}

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6 text-left">
                        <h3 className="font-semibold text-gray-800 mb-3">Issue Details</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>
                                <strong>Title:</strong> {successData.title}
                            </p>
                            <p>
                                <strong>Category:</strong> {successData.category}
                            </p>
                            {!successData.offline && (
                                <>
                                    <p>
                                        <strong>Status:</strong>{' '}
                                        <span className="text-yellow-600 font-medium">
                                            {successData.status}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Verification Progress:</strong> 0/{successData.verificationThreshold}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">
                        {successData.offline
                            ? 'You can continue reporting more issues while offline.'
                            : 'Other citizens can verify your report to increase its authenticity score and visibility to government officials.'}
                    </p>

                    <button
                        onClick={() => navigate('/dashboard/my-tickets')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                    >
                        {successData.offline ? 'Continue' : 'View My Reports'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreateTicket;
