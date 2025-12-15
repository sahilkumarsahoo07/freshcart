'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X, Search, Heart, MapPin } from 'lucide-react';

export default function Navbar() {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0); // This will be connected to cart state later

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            FreshCart
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for products..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Location */}
                        <button className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition">
                            <MapPin className="w-5 h-5" />
                            <span className="text-sm">Location</span>
                        </button>

                        {/* Wishlist */}
                        <Link href="/wishlist" className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition">
                            <Heart className="w-5 h-5" />
                            <span className="text-sm">Wishlist</span>
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition relative">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="text-sm">Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {session ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {session.user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm">{session.user.name}</span>
                                </button>

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    {session.user.role === 'ADMIN' && (
                                        <Link href="/admin" className="block px-4 py-2 text-green-600 font-semibold hover:bg-green-50 rounded-t-lg">
                                            🔐 Admin Dashboard
                                        </Link>
                                    )}
                                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        My Profile
                                    </Link>
                                    <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        My Orders
                                    </Link>
                                    <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        Settings
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-lg"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition shadow-md"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-gray-700"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="container mx-auto px-4 py-4 space-y-3">
                        <Link href="/wishlist" className="flex items-center space-x-2 text-gray-700 hover:text-green-600 py-2">
                            <Heart className="w-5 h-5" />
                            <span>Wishlist</span>
                        </Link>
                        <Link href="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-green-600 py-2 relative">
                            <ShoppingCart className="w-5 h-5" />
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {session ? (
                            <>
                                {session.user.role === 'ADMIN' && (
                                    <Link href="/admin" className="block text-green-600 font-semibold hover:text-green-700 py-2">
                                        🔐 Admin Dashboard
                                    </Link>
                                )}
                                <Link href="/profile" className="block text-gray-700 hover:text-green-600 py-2">
                                    My Profile
                                </Link>
                                <Link href="/orders" className="block text-gray-700 hover:text-green-600 py-2">
                                    My Orders
                                </Link>
                                <Link href="/addresses" className="block text-gray-700 hover:text-green-600 py-2">
                                    Addresses
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="block w-full text-left text-red-600 py-2"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="space-y-2 pt-2">
                                <Link
                                    href="/login"
                                    className="block w-full text-center px-4 py-2 border border-green-600 text-green-600 rounded-lg font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="block w-full text-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
