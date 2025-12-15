'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        revenue: 0,
    });
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch real stats from API
            const res = await fetch('/api/admin/stats');
            const data = await res.json();

            setStats({
                totalProducts: data.totalProducts || 0,
                totalUsers: data.totalUsers || 0,
                totalOrders: data.totalOrders || 0,
                revenue: data.revenue || 0,
            });

            // Set low stock products
            setLowStockProducts(data.lowStockProducts || []);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome to your admin dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    trend="up"
                    trendValue="+12%"
                    color="green"
                />
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    trend="up"
                    trendValue="+8%"
                    color="blue"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingCart}
                    trend="up"
                    trendValue="+23%"
                    color="purple"
                />
                <StatsCard
                    title="Revenue"
                    value={`₹${stats.revenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="up"
                    trendValue="+15%"
                    color="yellow"
                />
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-bold text-red-900">Low Stock Alert</h3>
                    </div>
                    <p className="text-red-700 mb-4">
                        {lowStockProducts.length} product(s) are running low on stock
                    </p>
                    <div className="space-y-2">
                        {lowStockProducts.slice(0, 5).map((product) => (
                            <div key={product._id} className="flex items-center justify-between bg-white p-3 rounded">
                                <span className="font-medium text-gray-900">{product.name}</span>
                                <span className="text-red-600 font-bold">{product.stock} left</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a
                    href="/admin/products/new"
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition border border-gray-100 group"
                >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Add New Product</h3>
                    <p className="text-sm text-gray-600">Create a new product listing</p>
                </a>

                <a
                    href="/admin/users"
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition border border-gray-100 group"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Manage Users</h3>
                    <p className="text-sm text-gray-600">View and manage all users</p>
                </a>

                <a
                    href="/admin/analytics"
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition border border-gray-100 group"
                >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">View Analytics</h3>
                    <p className="text-sm text-gray-600">Check performance metrics</p>
                </a>
            </div>
        </div>
    );
}
