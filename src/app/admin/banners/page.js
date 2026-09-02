'use client';

import { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBannersPage() {
    const [banners, setBanners] = useState([
        { id: 'b1', title: 'Express 10-Min Delivery Banner', badge: '10 Mins', subtitle: 'Farm Fresh Produce Delivered Fast', status: 'Active' },
        { id: 'b2', title: 'Flat 50% OFF Flash Sale Banner', badge: '50% OFF', subtitle: 'Valid on orders above ₹299', status: 'Active' },
        { id: 'b3', title: 'Organic Dairy & Farm Eggs Banner', badge: 'Organic', subtitle: 'Pure milk & dairy daily', status: 'Inactive' },
    ]);

    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        badge: '',
        subtitle: ''
    });

    const handleCreateBanner = (e) => {
        e.preventDefault();
        const newBanner = {
            id: `b_${Date.now()}`,
            ...formData,
            status: 'Active'
        };
        setBanners([...banners, newBanner]);
        toast.success(`Banner created!`);
        setModalOpen(false);
    };

    const handleToggleStatus = (id) => {
        setBanners(banners.map(b => b.id === id ? { ...b, status: b.status === 'Active' ? 'Inactive' : 'Active' } : b));
        toast.success('Banner status updated!');
    };

    const handleDelete = (id) => {
        setBanners(banners.filter(b => b.id !== id));
        toast.success('Banner deleted.');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-emerald-600" />
                        Hero Promotional Banners Listing
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Control active promotional banners displayed on storefront home</p>
                </div>

                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow flex items-center gap-2 self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Add Hero Banner
                </button>
            </div>

            {/* Banners Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-extrabold tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="py-3.5 px-4">Banner Title</th>
                                <th className="py-3.5 px-4">Badge Text</th>
                                <th className="py-3.5 px-4">Subtitle</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {banners.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50 transition">
                                    <td className="py-3.5 px-4 font-bold text-gray-900">{b.title}</td>
                                    <td className="py-3.5 px-4">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                            {b.badge}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-xs text-gray-500">{b.subtitle}</td>
                                    <td className="py-3.5 px-4">
                                        <button
                                            onClick={() => handleToggleStatus(b.id)}
                                            className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase transition ${
                                                b.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {b.status}
                                        </button>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-black text-lg text-gray-900">Add Hero Banner</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBanner} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Banner Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Summer Fruit Extravaganza"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Badge Text</label>
                                <input
                                    type="text"
                                    value={formData.badge}
                                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                    placeholder="e.g. Flat 30% OFF"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle *</label>
                                <textarea
                                    rows="2"
                                    required
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    placeholder="Short headline description..."
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                                ></textarea>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow"
                                >
                                    Save Banner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
