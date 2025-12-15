import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

// GET - Get all orders (Admin only)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build query
        let query = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.orderNumber = { $regex: search, $options: 'i' };
        }

        // Fetch orders
        console.log('Fetching orders with query:', query);
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('assignedDeliveryPartner', 'name email phone')
            .populate({
                path: 'items.product',
                select: 'name images stock',
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 })
            .limit(100);

        console.log(`Found ${orders.length} orders`);

        // Get counts by status
        const totalOrders = await Order.countDocuments();
        const pending = await Order.countDocuments({ status: 'PLACED' });
        const confirmed = await Order.countDocuments({ status: 'CONFIRMED' });
        const outForDelivery = await Order.countDocuments({ status: 'OUT_FOR_DELIVERY' });
        const delivered = await Order.countDocuments({ status: 'DELIVERED' });
        const cancelled = await Order.countDocuments({ status: 'CANCELLED' });

        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { status: 'DELIVERED' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        return NextResponse.json({
            orders,
            stats: {
                total: totalOrders,
                pending,
                confirmed,
                outForDelivery,
                delivered,
                cancelled,
                revenue: totalRevenue
            }
        });

    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({
            error: 'Failed to fetch orders',
            message: error.message
        }, { status: 500 });
    }
}
