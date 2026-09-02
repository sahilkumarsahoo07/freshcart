'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Eye, Zap, ArrowRight, RefreshCw, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '@/store/useCartStore';

export default function MyOrdersPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const addItem = useCartStore((state) => state.addItem);

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

    const handleReorder = (order) => {
        if (!order?.items) return;
        order.items.forEach((item) => {
            addItem({
                _id: item.product?._id || item.product,
                name: item.name,
                price: item.price,
                discountPrice: item.price,
                images: [item.image],
            });
        });
        toast.success(`Readded ${order.items.length} items to your cart!`);
        router.push('/cart');
    };

    const getStatusIcon = (status) => {
        const icons = {
            PLACED: <Clock className="w-4 h-4" />,
            CONFIRMED: <CheckCircle className="w-4 h-4" />,
            PREPARING: <Package className="w-4 h-4 text-amber-500 animate-pulse" />,
            OUT_FOR_DELIVERY: <Truck className="w-4 h-4 text-emerald-600 animate-bounce" />,
            DELIVERED: <CheckCircle className="w-4 h-4 text-emerald-600" />,
            CANCELLED: <XCircle className="w-4 h-4 text-rose-600" />,
        };
        return icons[status] || <Package className="w-4 h-4" />;
    };

    const getStatusBadge = (status) => {
        const badges = {
            PLACED: 'bg-blue-100 text-blue-800 border border-blue-200',
            CONFIRMED: 'bg-purple-100 text-purple-800 border border-purple-200',
            PREPARING: 'bg-amber-100 text-amber-900 border border-amber-300',
            OUT_FOR_DELIVERY: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 border-2 border-emerald-500 shadow-sm font-black',
            DELIVERED: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
            CANCELLED: 'bg-rose-100 text-rose-800 border border-rose-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
    };

    const activeOrders = orders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status));
    const filteredOrders = filterStatus
        ? orders.filter(order => order.status === filterStatus)
        : orders;

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-100">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs font-bold text-gray-500">Loading your grocery orders...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
            <Navbar />

            {/* Dark Glass Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white py-8 border-b border-emerald-800/40 shadow-xl">
                <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-yellow-400/30 mb-2">
                            <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span>10-MIN EXPRESS TRACKING</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white">My Orders</h1>
                        <p className="text-emerald-200/80 text-xs md:text-sm">Track live deliveries, view receipt details, or reorder items in 1-click</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-black text-emerald-300 flex items-center gap-2 w-max">
                        <Package className="w-4 h-4" />
                        <span>Total Orders: {orders.length}</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-6">

                {/* Active Live Orders Highlight Box */}
                {activeOrders.length > 0 && (
                    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-emerald-700/60 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                                <h2 className="font-black text-base text-yellow-300">Live Active Delivery ({activeOrders.length})</h2>
                            </div>
                            <span className="bg-emerald-800 text-emerald-200 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-600">
                                ⚡ ETA: 8-12 MINS
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeOrders.map((activeOrder) => (
                                <div key={activeOrder._id} className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono font-black text-xs text-white">#{activeOrder.orderNumber || activeOrder._id.slice(-6)}</span>
                                            <span className="text-[10px] font-black bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded">
                                                {activeOrder.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300 font-medium">
                                            {activeOrder.items?.length} items • ₹{activeOrder.finalAmount?.toFixed(0)}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/my-orders/${activeOrder._id}`}
                                        className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-black text-xs shadow hover:opacity-95 transition flex items-center gap-1"
                                    >
                                        <span>Track</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 overflow-x-auto">
                    <div className="flex items-center gap-2 min-w-max">
                        <button
                            onClick={() => setFilterStatus('')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                                filterStatus === ''
                                    ? 'bg-emerald-700 text-white shadow'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All Orders ({orders.length})
                        </button>
                        {['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(status => {
                            const count = orders.filter(o => o.status === status).length;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition ${
                                        filterStatus === status
                                            ? 'bg-emerald-700 text-white shadow'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {status.replace(/_/g, ' ')} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Orders List Grid */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-12 text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-700">
                            <Package className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2">No Orders Found</h2>
                        <p className="text-xs text-gray-500 mb-6">
                            {filterStatus ? `No orders with status ${filterStatus}` : "You haven't placed any orders yet."}
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-xl font-black text-xs hover:bg-emerald-800 transition"
                        >
                            Start Grocery Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 hover:border-emerald-300 transition">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-mono font-black text-base text-gray-900">Order #{order.orderNumber || order._id.slice(-6)}</h3>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${getStatusBadge(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span>{order.status.replace(/_/g, ' ')}</span>
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-semibold">
                                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-left md:text-right">
                                            <p className="text-xs text-gray-400 font-semibold">Total Amount</p>
                                            <p className="text-xl font-black text-emerald-700">₹{(order.finalAmount || order.totalAmount).toFixed(2)}</p>
                                        </div>

                                        <Link
                                            href={`/my-orders/${order._id}`}
                                            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs shadow transition flex items-center gap-1.5"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>Track / View</span>
                                        </Link>

                                        <button
                                            onClick={() => handleReorder(order)}
                                            className="px-3.5 py-2.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-xl font-extrabold text-xs transition flex items-center gap-1 border border-gray-200"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            <span>Reorder</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Items Preview Strip */}
                                <div className="pt-4 flex items-center gap-3 overflow-x-auto">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl p-2 min-w-max">
                                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 border border-gray-200">
                                                <Image src={item.image || '/placeholder-product.jpg'} alt={item.name} fill className="object-cover rounded-lg" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-gray-900 truncate max-w-[120px]">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-semibold">Qty: {item.quantity} • ₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
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
