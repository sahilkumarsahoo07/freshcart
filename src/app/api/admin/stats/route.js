import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';

// GET - Get dashboard statistics (Admin only)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get real counts from database
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'CUSTOMER' });
        const totalOrders = await Order.countDocuments();
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
            .select('name stock images')
            .limit(10);

        // Calculate total revenue from delivered orders
        const revenueResult = await Order.aggregate([
            { $match: { status: 'DELIVERED' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const revenue = revenueResult[0]?.total || 0;

        const stats = {
            totalProducts,
            totalUsers,
            totalOrders,
            revenue,
            lowStockProducts
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
