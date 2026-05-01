import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { HiOutlineFilter, HiOutlineEye, HiOutlineTrash, HiOutlineChatAlt } from 'react-icons/hi';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [filters, setFilters] = useState({ category: '', status: '' });
    const [loading, setLoading] = useState(true);
    const [noteModal, setNoteModal] = useState({ open: false, ticketId: null });
    const [noteText, setNoteText] = useState('');
    const [statusModal, setStatusModal] = useState({ open: false, ticketId: null, current: '' });
    const [newStatus, setNewStatus] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (filters.category) params.category = filters.category;
            if (filters.status) params.status = filters.status;
            const { data } = await api.get('/tickets/admin/all', { params });
            setTickets(data.data); setTotal(data.total); setPages(data.pages);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTickets(); }, [page, filters]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this ticket?')) return;
        try { await api.delete(`/tickets/admin/${id}`); fetchTickets(); } catch (err) { console.error(err); }
    };

    const handleStatusUpdate = async () => {
        try {
            await api.put(`/tickets/admin/${statusModal.ticketId}/status`, { status: newStatus });
            setStatusModal({ open: false, ticketId: null, current: '' });
            fetchTickets();
        } catch (err) { console.error(err); }
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        try {
            await api.post(`/tickets/admin/${noteModal.ticketId}/notes`, { note: noteText });
            setNoteModal({ open: false, ticketId: null }); setNoteText('');
            fetchTickets();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6 animate-fadeInUp">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-surface-800">All Tickets ({total})</h1>
                <div className="flex items-center gap-2">
                    <HiOutlineFilter className="w-4 h-4 text-surface-400" />
                    <select value={filters.category} onChange={e => { setFilters({ ...filters, category: e.target.value }); setPage(1); }} className="input-field w-auto text-sm">
                        <option value="">All Categories</option>
                        <option value="Road">Road</option><option value="Water">Water</option>
                        <option value="Electricity">Electricity</option><option value="Garbage">Garbage</option><option value="Other">Other</option>
                    </select>
                    <select value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }} className="input-field w-auto text-sm">
                        <option value="">All Statuses</option>
                        <option value="Submitted">Submitted</option><option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option><option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600" /></div>
            ) : tickets.length === 0 ? (
                <div className="card text-center py-12 text-surface-500">No tickets found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-surface-200 text-left text-surface-500">
                            <th className="pb-3 font-medium">Title</th><th className="pb-3 font-medium">Category</th>
                            <th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Reporter</th>
                            <th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-surface-100">
                            {tickets.map(t => (
                                <tr key={t._id} className="hover:bg-surface-50 transition-colors">
                                    <td className="py-3 font-medium text-surface-800 max-w-[200px] truncate">{t.title}</td>
                                    <td className="py-3 text-surface-600">{t.category}</td>
                                    <td className="py-3"><StatusBadge status={t.status} /></td>
                                    <td className="py-3 text-surface-600">{t.createdBy?.name}</td>
                                    <td className="py-3 text-surface-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link to={`/dashboard/ticket/${t._id}`} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500" title="View"><HiOutlineEye className="w-4 h-4" /></Link>
                                            <button onClick={() => { setStatusModal({ open: true, ticketId: t._id, current: t.status }); setNewStatus(t.status); }} className="p-2 rounded-lg hover:bg-primary-50 text-primary-600" title="Update Status">✏️</button>
                                            <button onClick={() => setNoteModal({ open: true, ticketId: t._id })} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600" title="Add Note"><HiOutlineChatAlt className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(t._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Delete"><HiOutlineTrash className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: pages }, (_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}>{i + 1}</button>
                    ))}
                </div>
            )}

            {/* Status Modal */}
            {statusModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fadeInUp">
                        <h3 className="font-semibold text-surface-800 mb-4">Update Status</h3>
                        <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field mb-4">
                            <option value="Submitted">Submitted</option><option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option><option value="Rejected">Rejected</option>
                        </select>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setStatusModal({ open: false, ticketId: null, current: '' })} className="btn-secondary">Cancel</button>
                            <button onClick={handleStatusUpdate} className="btn-primary">Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Note Modal */}
            {noteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fadeInUp">
                        <h3 className="font-semibold text-surface-800 mb-4">Add Progress Note</h3>
                        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} className="input-field resize-none mb-4" placeholder="Enter progress note..." />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setNoteModal({ open: false, ticketId: null }); setNoteText(''); }} className="btn-secondary">Cancel</button>
                            <button onClick={handleAddNote} className="btn-primary">Add Note</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTickets;
