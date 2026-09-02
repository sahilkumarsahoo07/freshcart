'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    User,
    ShoppingBag,
    MapPin,
    Heart,
    Clock,
    CheckCircle,
    ChevronRight,
    ArrowRight,
    Settings,
    Truck,
    PackageCheck
} from 'lucide-react';
import useWishlistStore from '@/store/useWishlistStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCartBar from '@/components/cart/FloatingCartBar';

export default function CustomerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const wishlistCount = useWishlistStore((state) => state.getCount());

    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/customer');
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const [ordersRes, addrRes] = await Promise.all([
                    fetch('/api/orders'),
                    fetch('/api/user/addresses')
                ]);

                if (ordersRes.ok) {
                    const data = await ordersRes.json();
                    setOrders(data.orders || []);
                }
                if (addrRes.ok) {
                    const data = await addrRes.json();
                    setAddresses(data.addresses || []);
                }
            } catch (err) {
                console.error('Error loading customer dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchUserData();
        }
    }, [session, status, router]);

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-semibold text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const activeOrders = orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED');
    const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED');

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4 max-w-6xl space-y-8">
                    {/* Header Welcome Banner */}
                    <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-green-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-black border border-white/20">
                                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl md:text-3xl font-black">Welcome back, {session?.user?.name}!</h1>
                                </div>
                                <p className="text-xs text-emerald-200 mt-1">{session?.user?.email}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/customer/profile"
                                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                Edit Profile
                            </Link>
                            <Link
                                href="/customer/addresses"
                                className="bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow flex items-center gap-2"
                            >
                                <MapPin className="w-4 h-4" />
                                Manage Addresses
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{activeOrders.length}</p>
                                <p className="text-xs text-gray-500 font-medium">Active Orders</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <PackageCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{completedOrders.length}</p>
                                <p className="text-xs text-gray-500 font-medium">Delivered Orders</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{addresses.length}</p>
                                <p className="text-xs text-gray-500 font-medium">Saved Addresses</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                                <Heart className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{wishlistCount}</p>
                                <p className="text-xs text-gray-500 font-medium">Wishlist Items</p>
                            </div>
                        </div>
                    </div>

                    {/* Active Order Highlight Card */}
                    {activeOrders.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-300 rounded-3xl p-6 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center animate-bounce flex-shrink-0">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                            Order in Progress
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900 mt-1">
                                            Order #{activeOrders[0]._id.slice(-6)} is currently {activeOrders[0].orderStatus}
                                        </h3>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            Estimated delivery in 10-15 minutes. Track live status on map.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={`/my-orders/${activeOrders[0]._id}`}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow flex items-center gap-2 self-start md:self-auto"
                                >
                                    <span>Track Live Order</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Recent Orders Section */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                                Recent Orders
                            </h2>
                            <Link href="/my-orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                                View All Orders <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.slice(0, 3).map((order) => (
                                    <div key={order._id} className="bg-gray-50 hover:bg-emerald-50/50 p-4 rounded-2xl border border-gray-100 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-extrabold text-sm text-gray-900">
                                                    Order #{order._id.slice(-6)}
                                                </span>
                                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                                                    order.orderStatus === 'DELIVERED'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : order.orderStatus === 'CANCELLED'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {order.items?.length || 0} items • Total: ₹{order.totalAmount} • {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/my-orders/${order._id}`}
                                                className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 text-xs font-bold px-4 py-2 rounded-xl transition"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                <p className="text-sm">No orders placed yet.</p>
                                <Link href="/products" className="mt-2 inline-block text-xs text-emerald-600 font-bold hover:underline">
                                    Start shopping now
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Navigation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link
                            href="/customer/profile"
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition group"
                        >
                            <User className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition" />
                            <h3 className="font-bold text-gray-900">Personal Information</h3>
                            <p className="text-xs text-gray-500 mt-1">Update your name, email, phone number and password.</p>
                        </Link>

                        <Link
                            href="/customer/addresses"
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition group"
                        >
                            <MapPin className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition" />
                            <h3 className="font-bold text-gray-900">Delivery Addresses</h3>
                            <p className="text-xs text-gray-500 mt-1">Add home, work or friend addresses with interactive map.</p>
                        </Link>

                        <Link
                            href="/settings"
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition group"
                        >
                            <Settings className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition" />
                            <h3 className="font-bold text-gray-900">Account Preferences</h3>
                            <p className="text-xs text-gray-500 mt-1">Manage notification settings, security & payment methods.</p>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
            <FloatingCartBar />
        </div>
    );
}
