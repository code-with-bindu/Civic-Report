import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { HiOutlinePhotograph } from 'react-icons/hi';

const EditTicket = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', description: '', category: 'Road', location: '' });
    const [existingMedia, setExistingMedia] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/tickets/${id}`);
                const t = data.data;
                setForm({ title: t.title, description: t.description, category: t.category, location: t.location });
                setExistingMedia(t.media || []);
            } catch { setError('Failed to load ticket.'); }
            finally { setFetching(false); }
        })();
    }, [id]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        setNewFiles(selected);
        setNewPreviews(selected.map(f => f.type.startsWith('video/') ? 'video' : URL.createObjectURL(f)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            newFiles.forEach(f => fd.append('media', f));
            await api.put(`/tickets/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate(`/dashboard/ticket/${id}`);
        } catch (err) { setError(err.response?.data?.message || 'Failed to update ticket.'); }
        finally { setLoading(false); }
    };

    if (fetching) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600" /></div>;

    return (
        <div className="max-w-2xl mx-auto animate-fadeInUp">
            <h1 className="text-2xl font-bold text-surface-800 mb-6">Edit Ticket</h1>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="card space-y-5">
                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Title *</label>
                    <input type="text" name="title" required value={form.title} onChange={handleChange} className="input-field" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Description *</label>
                    <textarea name="description" required rows={4} value={form.description} onChange={handleChange} className="input-field resize-none" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Category *</label>
                        <select name="category" value={form.category} onChange={handleChange} className="input-field">
                            <option value="Road">🛣️ Road</option><option value="Water">💧 Water</option>
                            <option value="Electricity">⚡ Electricity</option><option value="Garbage">🗑️ Garbage</option>
                            <option value="Other">📋 Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Location *</label>
                        <input type="text" name="location" required value={form.location} onChange={handleChange} className="input-field" />
                    </div>
                </div>
                {existingMedia.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Existing Media</label>
                        <div className="flex flex-wrap gap-3">
                            {existingMedia.map((m, i) => (
                                <div key={i}>{m.resourceType === 'video' ? <div className="w-20 h-20 rounded-lg bg-surface-200 flex items-center justify-center text-xs">🎬</div> : <img src={m.url} alt="" className="w-20 h-20 rounded-lg object-cover border border-surface-200" />}</div>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Add More Media</label>
                    <div className="border-2 border-dashed border-surface-300 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
                        <input type="file" id="edit-media" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                        <label htmlFor="edit-media" className="cursor-pointer"><HiOutlinePhotograph className="w-8 h-8 text-surface-300 mx-auto mb-1" /><p className="text-sm text-surface-500">Click to add files</p></label>
                    </div>
                    {newPreviews.length > 0 && <div className="flex flex-wrap gap-3 mt-3">{newPreviews.map((src, i) => <div key={i}>{src === 'video' ? <div className="w-20 h-20 rounded-lg bg-surface-200 flex items-center justify-center text-xs">🎬</div> : <img src={src} alt="" className="w-20 h-20 rounded-lg object-cover border" />}</div>)}</div>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Updating...' : 'Update Ticket'}</button>
            </form>
        </div>
    );
};

export default EditTicket;
