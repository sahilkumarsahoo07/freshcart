'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Eye } from 'lucide-react';

export default function MyOrdersPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?redirect=/my-orders');
            return;
        }

        if (status === 'authenticated') {
            fetchOrders();
        }
    }, [status, router]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data.orders || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            PLACED: <Clock className="w-5 h-5" />,
            CONFIRMED: <CheckCircle className="w-5 h-5" />,
            PREPARING: <Package className="w-5 h-5" />,
            OUT_FOR_DELIVERY: <Truck className="w-5 h-5" />,
            DELIVERED: <CheckCircle className="w-5 h-5" />,
            CANCELLED: <XCircle className="w-5 h-5" />,
        };
        return icons[status] || <Package className="w-5 h-5" />;
    };

    const getStatusColor = (status) => {
        const colors = {
            PLACED: 'bg-blue-100 text-blue-700',
            CONFIRMED: 'bg-purple-100 text-purple-700',
            PREPARING: 'bg-yellow-100 text-yellow-700',
            OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
            DELIVERED: 'bg-green-100 text-green-700',
            CANCELLED: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const filteredOrders = filterStatus
        ? orders.filter(order => order.status === filterStatus)
        : orders;

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">Track and manage your orders</p>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex items-center gap-4 overflow-x-auto">
                        <button
                            onClick={() => setFilterStatus('')}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${filterStatus === '' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Orders ({orders.length})
                        </button>
                        {['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map(status => {
                            const count = orders.filter(o => o.status === status).length;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${filterStatus === status ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status.replace(/_/g, ' ')} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
                        <p className="text-gray-600 mb-6">
                            {filterStatus ? `You don't have any ${filterStatus.toLowerCase()} orders` : "You haven't placed any orders yet"}
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{order.orderNumber}</h3>
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                            <p className="text-2xl font-bold text-green-600">₹{order.finalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Package className="w-5 h-5 text-gray-400" />
                                            <p className="font-semibold text-gray-900">{order.items.length} item(s)</p>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {order.items.slice(0, 4).map((item, index) => (
                                                <div key={index} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                    <Image
                                                        src={item.image || '/placeholder-product.jpg'}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {order.items.length > 4 && (
                                                <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                    <p className="text-sm font-semibold text-gray-600">+{order.items.length - 4}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.deliveryAddress.fullName}</p>
                                                <p className="text-sm text-gray-600">
                                                    {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Link
                                            href={`/my-orders/${order._id}`}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-center flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-5 h-5" />
                                            View Details
                                        </Link>
                                        {order.status === 'DELIVERED' && (
                                            <button className="px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition">
                                                Reorder
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
