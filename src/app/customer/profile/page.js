'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AddressManager from '@/components/customer/AddressManager';
import { User, Mail, Phone, MapPin, ShoppingBag, Loader } from 'lucide-react';

export default function CustomerProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('addresses');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?redirect=/customer/profile');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your account and addresses</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                            {/* User Info */}
                            <div className="text-center mb-6 pb-6 border-b border-gray-200">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">{session.user.name}</h3>
                                <p className="text-sm text-gray-600">{session.user.email}</p>
                            </div>

                            {/* Navigation */}
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${activeTab === 'addresses'
                                            ? 'bg-green-100 text-green-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <MapPin className="w-5 h-5" />
                                    My Addresses
                                </button>
                                <button
                                    onClick={() => router.push('/my-orders')}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    My Orders
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'addresses' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <AddressManager />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
