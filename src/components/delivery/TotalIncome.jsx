'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package, Calendar, IndianRupee, Award, Clock } from 'lucide-react';

export default function TotalIncome() {
    const [earnings, setEarnings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all');
    const [recentDeliveries, setRecentDeliveries] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        fetchEarnings();
    }, [period]);

    const fetchEarnings = async () => {
        try {
            setIsTransitioning(true);
            const res = await fetch(`/api/delivery/earnings?period=${period}`);
            const data = await res.json();

            if (data.success) {
                // Small delay to ensure smooth transition
                setTimeout(() => {
                    setEarnings(data.earnings);
                    setRecentDeliveries(data.recentDeliveries || []);
                    setIsTransitioning(false);
                }, 150);
            }
        } catch (error) {
            console.error('Error fetching earnings:', error);
            setIsTransitioning(false);
        } finally {
            setLoading(false);
        }
    };

    const getPeriodLabel = () => {
        switch (period) {
            case 'today': return 'Today';
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            case 'all': return 'All Time';
            default: return 'All Time';
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 mb-8 min-h-[400px] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 mb-8 border-2 border-green-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                        <IndianRupee className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Total Income</h2>
                        <p className="text-sm text-gray-600">{getPeriodLabel()}</p>
                    </div>
                </div>

                {/* Period Filter */}
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-md">
                    <button
                        onClick={() => setPeriod('today')}
                        disabled={isTransitioning}
                        className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${period === 'today'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setPeriod('week')}
                        disabled={isTransitioning}
                        className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${period === 'week'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        disabled={isTransitioning}
                        className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${period === 'month'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Month
                    </button>
                    <button
                        onClick={() => setPeriod('all')}
                        disabled={isTransitioning}
                        className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${period === 'all'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        All Time
                    </button>
                </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Earnings Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Base Earnings */}
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                            <p className="text-sm text-gray-600 font-semibold">Base Pay</p>
                            <p className="text-xs text-gray-500">₹30 × {earnings?.totalOrders || 0} deliveries</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700">₹{earnings?.totalBaseEarnings || 0}</p>
                    </div>

                    {/* Item Bonuses */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                            <p className="text-sm text-gray-600 font-semibold">Item Bonuses</p>
                            <p className="text-xs text-gray-500">₹5 × {earnings?.totalItems || 0} items</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">₹{earnings?.totalItemBonuses || 0}</p>
                    </div>

                    {/* Distance Bonuses */}
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div>
                            <p className="text-sm text-gray-600 font-semibold">Distance Bonuses</p>
                            <p className="text-xs text-gray-500">₹10 × {earnings?.totalOrders || 0} deliveries</p>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">₹{earnings?.totalDistanceBonuses || 0}</p>
                    </div>
                </div>
            </div>

            {/* Recent Deliveries */}
            {recentDeliveries.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        Recent Deliveries
                    </h3>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {recentDeliveries.map((delivery, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Package className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">#{delivery.orderNumber}</p>
                                        <p className="text-xs text-gray-600">
                                            {new Date(delivery.deliveredAt).toLocaleDateString('en-IN', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">₹{delivery.earnings}</p>
                                    <p className="text-xs text-gray-500">{delivery.itemCount} items</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Earnings Message */}
            {earnings?.totalOrders === 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
                    <Package className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Deliveries Yet</h3>
                    <p className="text-gray-600">
                        {period === 'all'
                            ? 'Start accepting orders to earn money!'
                            : `No deliveries completed ${getPeriodLabel().toLowerCase()}`}
                    </p>
                </div>
            )}
        </div>
    );
}
