/* Active Orders Dashboard - v3.0 */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import TotalIncome from '@/components/delivery/TotalIncome';
import LocationTracker from '@/components/delivery/LocationTracker';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Store, CreditCard, Navigation } from 'lucide-react';

export default function DeliveryDashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            if (session.user.role !== 'DELIVERY') {
                router.push('/');
                return;
            }
            fetchOrders();
        }
    }, [status, session, router]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/delivery/orders');
            const data = await res.json();
            // Filter to show only ACTIVE orders (not delivered)
            const activeOrders = (data.orders || []).filter(o => o.status !== 'DELIVERED');
            setOrders(activeOrders);
            setStats(data.stats || {});
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const handlePickup = async (orderId) => {
        if (!confirm('Mark this order as picked up?')) return;

        try {
            const res = await fetch(`/api/delivery/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'pickup' }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error);
            }

            toast.success('Order marked as picked up!');
            fetchOrders();
        } catch (error) {
            toast.error(error.message || 'Failed to update order');
        }
    };

    const handleDeliver = async (orderId) => {
        if (!confirm('Mark this order as delivered?')) return;

        try {
            const res = await fetch(`/api/delivery/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'deliver' }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error);
            }

            toast.success('Order delivered successfully!');
            fetchOrders();
        } catch (error) {
            toast.error(error.message || 'Failed to update order');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            CONFIRMED: 'bg-purple-50 text-purple-700 border-purple-200',
            PREPARING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            OUT_FOR_DELIVERY: 'bg-orange-50 text-orange-700 border-orange-200',
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <DeliveryLayout session={session}>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Active Orders</h1>
                        <p className="text-gray-500 mt-1">Manage your current deliveries</p>
                    </div>

                    {/* Total Income */}
                    <TotalIncome />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <Package className="w-10 h-10 text-blue-600 bg-blue-50 rounded-lg p-2" />
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                                    <p className="text-xs text-gray-500">Total Orders</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <Clock className="w-10 h-10 text-yellow-600 bg-yellow-50 rounded-lg p-2" />
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
                                    <p className="text-xs text-gray-500">Pending Pickup</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <Truck className="w-10 h-10 text-orange-600 bg-orange-50 rounded-lg p-2" />
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{stats.active || 0}</p>
                                    <p className="text-xs text-gray-500">Out for Delivery</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <CheckCircle className="w-10 h-10 text-green-600 bg-green-50 rounded-lg p-2" />
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{stats.completed || 0}</p>
                                    <p className="text-xs text-gray-500">Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Orders List */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Deliveries</h2>
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No active orders</h3>
                                <p className="text-gray-500">You're all caught up! New orders will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {orders.map((order) => (
                                    <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{order.orderNumber}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(order.createdAt).toLocaleString('en-IN', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        {/* Locations */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Store className="w-4 h-4 text-blue-600" />
                                                    <h4 className="font-semibold text-blue-900 text-xs">PICKUP</h4>
                                                </div>
                                                <p className="font-semibold text-gray-900 text-sm">FreshMart Store</p>
                                                <p className="text-xs text-gray-600">123 Main Street, Mumbai</p>
                                            </div>

                                            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MapPin className="w-4 h-4 text-green-600" />
                                                    <h4 className="font-semibold text-green-900 text-xs">DELIVER</h4>
                                                </div>
                                                <p className="font-semibold text-gray-900 text-sm">{order.deliveryAddress.fullName}</p>
                                                <p className="text-xs text-gray-600">{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                                            </div>
                                        </div>

                                        {/* Contact & Payment */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <Phone className="w-4 h-4 text-blue-600" />
                                                <a href={`tel:${order.deliveryAddress.phone}`} className="font-semibold text-green-600 text-sm truncate">
                                                    {order.deliveryAddress.phone}
                                                </a>
                                            </div>

                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <CreditCard className="w-4 h-4 text-purple-600" />
                                                <p className="font-semibold text-gray-900 text-sm truncate">
                                                    ₹{order.finalAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Items Count */}
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-4">
                                            <Package className="w-4 h-4 text-green-600" />
                                            <p className="text-sm font-medium text-gray-700">{order.items.length} items to deliver</p>
                                        </div>

                                        {/* Location Tracker - Show when out for delivery */}
                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <div className="mb-4">
                                                <LocationTracker orderId={order._id} />
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {order.status === 'PREPARING' && (
                                                <button
                                                    onClick={() => handlePickup(order._id)}
                                                    className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm flex items-center justify-center gap-2"
                                                >
                                                    <Truck className="w-4 h-4" />
                                                    Mark Picked Up
                                                </button>
                                            )}
                                            {order.status === 'OUT_FOR_DELIVERY' && (
                                                <button
                                                    onClick={() => handleDeliver(order._id)}
                                                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Mark Delivered
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DeliveryLayout>
    );
}
