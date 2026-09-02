'use client';

import { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Search, X, Check, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState([
        { id: 'c1', code: 'FRESH50', discount: 'Flat 50% OFF', minOrder: 299, type: 'Percentage', value: 50, active: true, usageCount: 1420 },
        { id: 'c2', code: 'EXPRESS100', discount: '₹100 Instant Cashback', minOrder: 499, type: 'Fixed Amount', value: 100, active: true, usageCount: 890 },
        { id: 'c3', code: 'DAIRY20', discount: '20% OFF Dairy', minOrder: 199, type: 'Percentage', value: 20, active: true, usageCount: 650 },
        { id: 'c4', code: 'WELCOMEFULL', discount: 'Free Shipping', minOrder: 0, type: 'Free Delivery', value: 0, active: true, usageCount: 2300 },
    ]);

    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        code: '',
        discount: '',
        minOrder: 199,
        type: 'Percentage',
        value: 10,
        active: true
    });

    const handleCreateCoupon = (e) => {
        e.preventDefault();
        const newCoupon = {
            id: `c_${Date.now()}`,
            ...formData,
            usageCount: 0
        };
        setCoupons([newCoupon, ...coupons]);
        toast.success(`Coupon ${formData.code} created successfully!`);
        setModalOpen(false);
    };

    const handleToggleStatus = (id) => {
        setCoupons(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c));
        toast.success('Coupon status updated!');
    };

    const handleDelete = (id, code) => {
        if (!confirm(`Delete coupon code ${code}?`)) return;
        setCoupons(coupons.filter(c => c.id !== id));
        toast.success(`Coupon ${code} deleted.`);
    };

    const filtered = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Tag className="w-6 h-6 text-rose-500" />
                        Promo Coupons & Discounts Listing
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Manage promotional discount codes for customer checkout</p>
                </div>

                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow flex items-center gap-2 self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Create New Coupon
                </button>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search promo code..."
                        className="w-full max-w-xs px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-extrabold tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="py-3.5 px-4">Coupon Code</th>
                                <th className="py-3.5 px-4">Discount Details</th>
                                <th className="py-3.5 px-4">Min Order</th>
                                <th className="py-3.5 px-4">Total Redeemed</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition">
                                    <td className="py-3.5 px-4">
                                        <span className="bg-emerald-50 text-emerald-800 font-mono font-black px-3 py-1.5 rounded-lg text-xs border border-emerald-200">
                                            {c.code}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-bold text-gray-900">
                                        {c.discount}
                                    </td>
                                    <td className="py-3.5 px-4 font-bold text-gray-700">
                                        ₹{c.minOrder}
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-gray-600">
                                        {c.usageCount} times
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <button
                                            onClick={() => handleToggleStatus(c.id)}
                                            className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase transition ${
                                                c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {c.active ? 'Active' : 'Disabled'}
                                        </button>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => handleDelete(c.id, c.code)}
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
                            <h3 className="font-black text-lg text-gray-900">Create New Coupon</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. MEGA100"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Discount Label *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                    placeholder="e.g. Flat ₹100 OFF"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Min Order Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.minOrder}
                                        onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Discount Value</label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                                    />
                                </div>
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
                                    Save Coupon
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
