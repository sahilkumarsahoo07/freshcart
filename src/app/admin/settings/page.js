'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings as SettingsIcon, Bell, Shield, Database } from 'lucide-react';

export default function AdminSettingsPage() {
    const { data: session } = useSession();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        orderNotifications: true,
        lowStockAlerts: true,
        deliveryUpdates: true
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
                <p className="text-gray-600">Manage your admin preferences and configurations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{session?.user?.name}</h3>
                                <p className="text-sm text-gray-600">{session?.user?.role}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg font-semibold">
                                General Settings
                            </button>
                            <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold">
                                Notifications
                            </button>
                            <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold">
                                Security
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Settings */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <SettingsIcon className="w-5 h-5" />
                            General Settings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
                                <input
                                    type="text"
                                    defaultValue="FreshCart"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
                                <input
                                    type="email"
                                    defaultValue="support@freshcart.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Support Phone</label>
                                <input
                                    type="tel"
                                    defaultValue="+91 1234567890"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Notification Preferences
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900">Email Notifications</p>
                                    <p className="text-sm text-gray-600">Receive email updates</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('emailNotifications')}
                                    className={`relative w-14 h-7 rounded-full transition ${settings.emailNotifications ? 'bg-green-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition ${settings.emailNotifications ? 'translate-x-7' : ''
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900">Order Notifications</p>
                                    <p className="text-sm text-gray-600">Get notified of new orders</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('orderNotifications')}
                                    className={`relative w-14 h-7 rounded-full transition ${settings.orderNotifications ? 'bg-green-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition ${settings.orderNotifications ? 'translate-x-7' : ''
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900">Low Stock Alerts</p>
                                    <p className="text-sm text-gray-600">Alert when products are low</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('lowStockAlerts')}
                                    className={`relative w-14 h-7 rounded-full transition ${settings.lowStockAlerts ? 'bg-green-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition ${settings.lowStockAlerts ? 'translate-x-7' : ''
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900">Delivery Updates</p>
                                    <p className="text-sm text-gray-600">Track delivery status</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('deliveryUpdates')}
                                    className={`relative w-14 h-7 rounded-full transition ${settings.deliveryUpdates ? 'bg-green-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition ${settings.deliveryUpdates ? 'translate-x-7' : ''
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            System Information
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Version</span>
                                <span className="font-semibold text-gray-900">1.0.0</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Database</span>
                                <span className="font-semibold text-gray-900">MongoDB Atlas</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Environment</span>
                                <span className="font-semibold text-gray-900">Development</span>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
