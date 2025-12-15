'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import AssignDeliveryModal from '@/components/admin/AssignDeliveryModal';

export default function OrdersManagementPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [updateData, setUpdateData] = useState({ status: '', notes: '' });

    useEffect(() => {
        fetchOrders();
    }, [filterStatus, searchTerm]);

    const fetchOrders = async () => {
        try {
            let url = '/api/admin/orders?';
            if (filterStatus) url += `status=${filterStatus}&`;
            if (searchTerm) url += `search=${searchTerm}`;

            console.log('Fetching orders from:', url);
            const res = await fetch(url);
            const data = await res.json();
            console.log('Orders response:', data);
            console.log('Orders count:', data.orders?.length);
            setOrders(data.orders || []);
            setStats(data.stats || {});
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const handleUpdateOrder = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) throw new Error('Failed to update');

            toast.success('Order updated successfully!');
            setShowUpdateModal(false);
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update order');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            PLACED: 'bg-blue-100 text-blue-700',
            CONFIRMED: 'bg-purple-100 text-purple-700',
            PREPARING: 'bg-yellow-100 text-yellow-700',
            OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
            DELIVERED: 'bg-green-100 text-green-700',
            CANCELLED: 'bg-red-100 text-red-700'
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        const icons = {
            PLACED: Clock,
            CONFIRMED: CheckCircle,
            PREPARING: Package,
            OUT_FOR_DELIVERY: Truck,
            DELIVERED: CheckCircle,
            CANCELLED: XCircle
        };
        const Icon = icons[status] || Clock;
        return <Icon className="w-4 h-4" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
                <p className="text-gray-600">{orders.length} orders total</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <p className="text-gray-600 text-sm mb-2">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <p className="text-gray-600 text-sm mb-2">Pending</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.pending || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <p className="text-gray-600 text-sm mb-2">Delivered</p>
                    <p className="text-3xl font-bold text-green-600">{stats.delivered || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <p className="text-gray-600 text-sm mb-2">Revenue</p>
                    <p className="text-3xl font-bold text-purple-600">₹{stats.revenue?.toLocaleString() || 0}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="PLACED">Placed</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{order.user?.name}</p>
                                            <p className="text-sm text-gray-600">{order.user?.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-700">{order.items?.length} items</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-900">₹{order.finalAmount}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-600 text-sm">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => router.push(`/admin/orders/${order._id}`)}
                                                className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            {!order.assignedDeliveryPartner && (order.status === 'PLACED' || order.status === 'CONFIRMED') && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowAssignModal(true);
                                                    }}
                                                    className="p-2 hover:bg-orange-50 rounded-lg transition text-orange-600"
                                                    title="Assign Delivery Partner"
                                                >
                                                    <Truck className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setUpdateData({ status: order.status, notes: order.notes || '' });
                                                    setShowUpdateModal(true);
                                                }}
                                                className="p-2 hover:bg-green-50 rounded-lg transition text-green-600"
                                                title="Update Status"
                                            >
                                                <Package className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No orders found</p>
                    </div>
                )}
            </div>

            {/* Update Order Modal */}
            {showUpdateModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Order</h2>
                        <form onSubmit={handleUpdateOrder} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Order Number</label>
                                <input
                                    type="text"
                                    value={selectedOrder.orderNumber}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    value={updateData.status}
                                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="PLACED">Placed</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PREPARING">Preparing</option>
                                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={updateData.notes}
                                    onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Add notes..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                                >
                                    Update Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Delivery Partner Modal */}
            <AssignDeliveryModal
                order={selectedOrder}
                isOpen={showAssignModal}
                onClose={() => {
                    setShowAssignModal(false);
                    setSelectedOrder(null);
                }}
                onAssigned={() => {
                    fetchOrders();
                }}
            />
        </div>
    );
}
