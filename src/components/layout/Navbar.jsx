'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Search, Heart, MapPin, Tag, ShieldAlert, Package, Zap } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);

    const cartCount = useCartStore((state) => state.getCount());
    const wishlistCount = useWishlistStore((state) => state.getCount());

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (session?.user) {
            fetchActiveOrder();
        }
    }, [session]);

    const fetchActiveOrder = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                const active = data.orders?.find(o => ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status));
                setActiveOrder(active || null);
            }
        } catch (e) {
            console.error('Error fetching active order:', e);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-50">
            {/* Active Live Order Tracker Banner */}
            {activeOrder && (
                <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white py-2 px-4 border-b border-emerald-800/60 shadow-md">
                    <div className="container mx-auto max-w-6xl flex items-center justify-between gap-3 text-xs font-black">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-yellow-300 font-extrabold flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 fill-yellow-300" />
                                Live Order #{activeOrder.orderNumber || activeOrder._id.slice(-6)}
                            </span>
                            <span className="hidden sm:inline-block text-emerald-200">
                                Status: <span className="bg-emerald-800/90 text-white px-2 py-0.5 rounded-full text-[10px] font-black">{activeOrder.status.replace(/_/g, ' ')}</span>
                            </span>
                            <span className="hidden md:inline-block text-gray-300">• 10-Min Dispatch</span>
                        </div>

                        <Link
                            href={`/my-orders/${activeOrder._id}`}
                            className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black px-3.5 py-1 rounded-full text-[11px] transition shadow-md flex items-center gap-1 flex-shrink-0"
                        >
                            <span>Track Order</span>
                            <span>🚀</span>
                        </Link>
                    </div>
                </div>
            )}

            <nav className="bg-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md transform hover:rotate-6 transition-transform">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent tracking-tight">
                                FreshCart
                            </span>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search fresh fruits, vegetables, dairy & more..."
                                    className="w-full pl-10 pr-24 py-2 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-1.5 rounded-full transition shadow-sm"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            {/* Deals */}
                            <Link href="/deals" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-700 font-bold transition text-sm">
                                <Tag className="w-4 h-4 text-emerald-600" />
                                <span>Deals</span>
                            </Link>

                            {/* My Orders */}
                            <Link href="/my-orders" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-700 font-bold transition text-sm">
                                <Package className="w-4 h-4 text-teal-600" />
                                <span>Orders</span>
                            </Link>

                            {/* Wishlist */}
                            <Link href="/wishlist" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-700 font-bold transition text-sm relative">
                                <Heart className="w-4 h-4 text-rose-500" />
                                <span>Wishlist</span>
                                {mounted && wishlistCount > 0 && (
                                    <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart */}
                            <Link href="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-700 font-bold transition text-sm relative">
                                <ShoppingCart className="w-4 h-4 text-emerald-700" />
                                <span>Cart</span>
                                {mounted && cartCount > 0 && (
                                    <span className="bg-emerald-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Menu */}
                            {session ? (
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-gray-700 hover:text-emerald-700 transition">
                                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-700 to-teal-700 rounded-full flex items-center justify-center text-white font-black text-sm shadow">
                                            {session.user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-sm font-extrabold max-w-[100px] truncate">{session.user.name}</span>
                                    </button>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-[11px] text-gray-400">Signed in as</p>
                                            <p className="text-xs font-black text-gray-900 truncate">{session.user.email}</p>
                                        </div>

                                        {session.user.role === 'ADMIN' && (
                                            <Link href="/admin" className="block px-4 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-50">
                                                🔐 Admin Dashboard
                                            </Link>
                                        )}

                                        {session.user.role === 'DELIVERY' && (
                                            <Link href="/delivery" className="block px-4 py-2 text-xs font-black text-teal-700 hover:bg-teal-50">
                                                🚚 Delivery Partner Portal
                                            </Link>
                                        )}

                                        <Link href="/my-orders" className="block px-4 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-50 hover:text-emerald-700">
                                            📦 Track My Orders
                                        </Link>
                                        <Link href="/customer/profile" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-700">
                                            My Profile
                                        </Link>
                                        <Link href="/customer/addresses" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-700">
                                            Saved Addresses
                                        </Link>
                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                            <button
                                                onClick={() => signOut()}
                                                className="block w-full text-left px-4 py-2 text-xs font-black text-rose-600 hover:bg-rose-50"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm text-gray-700 hover:text-emerald-700 font-extrabold transition"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 text-white text-sm rounded-full font-black hover:from-emerald-800 hover:to-teal-800 transition shadow-md"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-gray-700 p-2"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="md:hidden pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-9 pr-20 py-2 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1/2 -translate-y-1/2 bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 py-3 px-4 space-y-2">
                        <Link href="/deals" className="block py-2 text-xs font-bold text-gray-700">🏷️ Deals & Offers</Link>
                        <Link href="/my-orders" className="block py-2 text-xs font-bold text-gray-700">📦 Track My Orders</Link>
                        <Link href="/cart" className="block py-2 text-xs font-bold text-gray-700">🛒 Cart ({cartCount})</Link>
                        {session ? (
                            <>
                                <Link href="/customer/profile" className="block py-2 text-xs font-bold text-gray-700">👤 Profile</Link>
                                <button onClick={() => signOut()} className="block w-full text-left py-2 text-xs font-bold text-rose-600">Sign Out</button>
                            </>
                        ) : (
                            <Link href="/login" className="block py-2 text-xs font-bold text-emerald-700">Login / Register</Link>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}
