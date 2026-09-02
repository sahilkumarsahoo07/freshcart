'use client';

import { useState } from 'react';
import { Utensils, Plus, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRecipesPage() {
    const [kits, setKits] = useState([
        { id: 'k1', title: 'Organic Guacamole Bowl Kit', icon: '🥑', items: '2 Avocados, 1 Lemon, Cilantro', price: 189, origPrice: 240, active: true },
        { id: 'k2', title: 'Immunity Citrus Juice Kit', icon: '🍊', items: '4 Oranges, 2 Lemons, Ginger', price: 149, origPrice: 199, active: true },
        { id: 'k3', title: 'Golden Turmeric Wellness Milk Kit', icon: '🥛', items: '1L Milk, Fresh Turmeric, Honey', price: 129, origPrice: 170, active: true },
    ]);

    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        icon: '🥑',
        items: '',
        price: 150,
        origPrice: 200
    });

    const handleCreateKit = (e) => {
        e.preventDefault();
        const newKit = {
            id: `k_${Date.now()}`,
            ...formData,
            active: true
        };
        setKits([...kits, newKit]);
        toast.success(`Recipe kit ${formData.title} added!`);
        setModalOpen(false);
    };

    const handleDelete = (id, title) => {
        if (!confirm(`Delete recipe kit ${title}?`)) return;
        setKits(kits.filter(k => k.id !== id));
        toast.success(`Kit deleted.`);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-emerald-600" />
                        1-Click Recipe Kits Listing
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Manage bundled recipe ingredients shown on storefront</p>
                </div>

                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow flex items-center gap-2 self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Add Recipe Kit
                </button>
            </div>

            {/* Kits Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-extrabold tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="py-3.5 px-4">Icon</th>
                                <th className="py-3.5 px-4">Kit Title</th>
                                <th className="py-3.5 px-4">Included Ingredients</th>
                                <th className="py-3.5 px-4">Bundle Price</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {kits.map((k) => (
                                <tr key={k.id} className="hover:bg-gray-50 transition">
                                    <td className="py-3.5 px-4 text-2xl">{k.icon}</td>
                                    <td className="py-3.5 px-4 font-bold text-gray-900">{k.title}</td>
                                    <td className="py-3.5 px-4 text-xs text-gray-500">{k.items}</td>
                                    <td className="py-3.5 px-4">
                                        <span className="font-black text-gray-900">₹{k.price}</span>
                                        <span className="text-xs text-gray-400 line-through ml-1.5">₹{k.origPrice}</span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => handleDelete(k.id, k.title)}
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

            {/* Create Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-black text-lg text-gray-900">Add Recipe Bundle Kit</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateKit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Kit Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Fresh Avocado Salad Kit"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Emoji Icon</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Kit Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Original (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.origPrice}
                                        onChange={(e) => setFormData({ ...formData, origPrice: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Ingredients List *</label>
                                <textarea
                                    rows="2"
                                    required
                                    value={formData.items}
                                    onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                                    placeholder="e.g. 2 Avocados, 1 Lemon, Fresh Herbs..."
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
                                    Add Recipe Kit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
