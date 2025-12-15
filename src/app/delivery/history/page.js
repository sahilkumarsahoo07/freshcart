/* Delivery History - Modern Design v2.0 */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import {
    Package,
    CheckCircle,
    Clock,
    MapPin,
    Phone,
    Store,
    CreditCard,
    History as HistoryIcon,
    Calendar,
    TrendingUp,
    Award,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function DeliveryHistory() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [filterPeriod, setFilterPeriod] = useState('all');

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
            fetchHistory();
        }
    }, [status, session, router, filterPeriod]);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/delivery/orders?status=DELIVERED');
            const data = await res.json();

            let filteredOrders = data.orders || [];

            // Apply period filter
            if (filterPeriod !== 'all') {
                const now = new Date();
                filteredOrders = filteredOrders.filter(order => {
                    const orderDate = new Date(order.deliveredAt || order.createdAt);
                    if (filterPeriod === 'today') {
                        return orderDate.toDateString() === now.toDateString();
                    } else if (filterPeriod === 'week') {
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return orderDate >= weekAgo;
                    } else if (filterPeriod === 'month') {
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return orderDate >= monthAgo;
                    }
                    return true;
                });
            }

            setOrders(filteredOrders);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching history:', error);
            setLoading(false);
        }
    };

    const calculateEarnings = (order) => {
        const baseEarning = 30;
        const itemBonus = (order.items?.length || 0) * 5;
        const distanceBonus = 10;
        return baseEarning + itemBonus + distanceBonus;
    };

    const totalEarnings = orders.reduce((sum, order) => sum + calculateEarnings(order), 0);
    const totalItems = orders.reduce((sum, order) => sum + (order.items?.length || 0), 0);

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading history...</p>
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
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                                <HistoryIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Delivery History</h1>
                                <p className="text-gray-500">Track your completed deliveries</p>
                            </div>
                        </div>
                    </div>

                    {/* Period Filter */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto">
                        <button
                            onClick={() => setFilterPeriod('all')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${filterPeriod === 'all' ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            All Time
                        </button>
                        <button
                            onClick={() => setFilterPeriod('today')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${filterPeriod === 'today' ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setFilterPeriod('week')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${filterPeriod === 'week' ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setFilterPeriod('month')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${filterPeriod === 'month' ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            This Month
                        </button>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Deliveries</p>
                                    <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                                    <p className="text-3xl font-bold text-green-600">₹{totalEarnings.toFixed(2)}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Award className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Items Delivered</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div>
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HistoryIcon className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No delivery history</h3>
                                <p className="text-gray-500">
                                    {filterPeriod === 'all'
                                        ? 'Completed deliveries will appear here'
                                        : `No deliveries completed ${filterPeriod === 'today' ? 'today' : `this ${filterPeriod}`}`
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => {
                                    const isExpanded = expandedOrder === order._id;
                                    const earnings = calculateEarnings(order);

                                    return (
                                        <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                            {/* Compact View */}
                                            <div
                                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-gray-900 mb-1">{order.orderNumber}</h3>
                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {new Date(order.deliveredAt || order.createdAt).toLocaleString('en-IN', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Package className="w-3.5 h-3.5" />
                                                                    {order.items?.length || 0} items
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-green-600">₹{earnings.toFixed(2)}</p>
                                                            <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                                                        </div>
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <div className="border-t border-gray-100 p-4 bg-gray-50">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        {/* Pickup */}
                                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Store className="w-4 h-4 text-blue-600" />
                                                                <p className="text-xs font-semibold text-blue-900">PICKUP</p>
                                                            </div>
                                                            <p className="font-semibold text-gray-900 text-sm">FreshMart Store</p>
                                                            <p className="text-xs text-gray-600">123 Main Street, Mumbai</p>
                                                        </div>

                                                        {/* Delivery */}
                                                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <MapPin className="w-4 h-4 text-green-600" />
                                                                <p className="text-xs font-semibold text-green-900">DELIVERED</p>
                                                            </div>
                                                            <p className="font-semibold text-gray-900 text-sm">{order.deliveryAddress?.fullName}</p>
                                                            <p className="text-xs text-gray-600">{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                                                        </div>
                                                    </div>

                                                    {/* Items */}
                                                    {order.items && order.items.length > 0 && (
                                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                            <p className="text-xs font-semibold text-gray-700 mb-2">Items Delivered:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {order.items.map((item, index) => (
                                                                    <div key={index} className="text-xs bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                                                        {item.name} <span className="text-gray-500">×{item.quantity}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Earnings Breakdown */}
                                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                                        <div className="bg-white rounded-lg p-2 text-center border border-gray-200">
                                                            <p className="text-xs text-gray-500">Base</p>
                                                            <p className="text-sm font-bold text-gray-900">₹30</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-2 text-center border border-gray-200">
                                                            <p className="text-xs text-gray-500">Items</p>
                                                            <p className="text-sm font-bold text-gray-900">₹{(order.items?.length || 0) * 5}</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-2 text-center border border-gray-200">
                                                            <p className="text-xs text-gray-500">Distance</p>
                                                            <p className="text-sm font-bold text-gray-900">₹10</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DeliveryLayout>
    );
}
