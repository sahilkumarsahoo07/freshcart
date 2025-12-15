'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Package, History, User, LogOut, Truck } from 'lucide-react';
import { signOut } from 'next-auth/react';
import OrderNotifications from './OrderNotifications';

export default function DeliveryLayout({ children, session }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Active Orders', href: '/delivery', icon: Package },
        { name: 'Delivery History', href: '/delivery/history', icon: History },
        { name: 'Profile', href: '/delivery/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Menu Toggle */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                            <div className="flex items-center gap-2">
                                <Truck className="w-8 h-8 text-green-600" />
                                <span className="text-xl font-bold text-gray-900">Delivery Partner</span>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                                <p className="font-semibold text-gray-900">{session?.user?.name}</p>
                                <p className="text-sm text-gray-600">Delivery Partner</p>
                            </div>
                            {session?.user?.image ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-600">
                                    <img
                                        src={session.user.image}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {session?.user?.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar - Desktop */}
                <aside className="hidden lg:block w-64 bg-white shadow-md min-h-screen">
                    <nav className="p-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${isActive
                                        ? 'bg-green-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Mobile Sidebar */}
                {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
                        <aside className="w-64 bg-white h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                                    <button onClick={() => setSidebarOpen(false)}>
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <nav className="space-y-2">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${isActive
                                                    ? 'bg-green-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        </aside>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>

            {/* Real-time Order Notifications */}
            <OrderNotifications />
        </div>
    );
}
