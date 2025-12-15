'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Truck, User } from 'lucide-react';

export default function AssignDeliveryModal({ order, isOpen, onClose, onAssigned }) {
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingPartners, setFetchingPartners] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchDeliveryPartners();
        }
    }, [isOpen]);

    const fetchDeliveryPartners = async () => {
        try {
            const res = await fetch('/api/admin/delivery-partners/available');
            const data = await res.json();
            setDeliveryPartners(data.deliveryPartners || []);
            setFetchingPartners(false);
        } catch (error) {
            console.error('Error fetching delivery partners:', error);
            toast.error('Failed to load delivery partners');
            setFetchingPartners(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();

        if (!selectedPartner) {
            toast.error('Please select a delivery partner');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/admin/orders/${order._id}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliveryPartnerId: selectedPartner }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error);
            }

            toast.success('Delivery partner assigned successfully!');
            onAssigned();
            onClose();
        } catch (error) {
            toast.error(error.message || 'Failed to assign delivery partner');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Assign Delivery Partner</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="font-bold text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600 mt-2">Customer: {order.user?.name}</p>
                    <p className="text-sm text-gray-600">Amount: ₹{order.finalAmount}</p>
                </div>

                <form onSubmit={handleAssign} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Delivery Partner *
                        </label>

                        {fetchingPartners ? (
                            <div className="text-center py-4">
                                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : deliveryPartners.length === 0 ? (
                            <div className="text-center py-4 bg-yellow-50 rounded-lg">
                                <p className="text-yellow-700">No delivery partners available</p>
                                <p className="text-sm text-yellow-600 mt-1">Create delivery partner accounts first</p>
                            </div>
                        ) : (
                            <select
                                value={selectedPartner}
                                onChange={(e) => setSelectedPartner(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="">-- Select Delivery Partner --</option>
                                {deliveryPartners.map((partner) => (
                                    <option key={partner._id} value={partner._id}>
                                        {partner.name} - {partner.phone || partner.email}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <p className="text-sm text-blue-700">
                            <strong>Note:</strong> Assigning a delivery partner will change the order status to "PREPARING"
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || deliveryPartners.length === 0}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <Truck className="w-5 h-5" />
                                    Assign Partner
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
