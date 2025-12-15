import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { calculateTotalEarnings } from '@/lib/earningsCalculator';

// GET - Get delivery partner's earnings
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'DELIVERY') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'all'; // today, week, month, all

        // Build date filter
        let dateFilter = {};
        const now = new Date();

        switch (period) {
            case 'today':
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                dateFilter = { deliveredAt: { $gte: startOfDay } };
                break;

            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
                startOfWeek.setHours(0, 0, 0, 0);
                dateFilter = { deliveredAt: { $gte: startOfWeek } };
                break;

            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                dateFilter = { deliveredAt: { $gte: startOfMonth } };
                break;

            case 'all':
            default:
                // No date filter
                break;
        }

        // Fetch delivered orders for this delivery partner
        const query = {
            assignedDeliveryPartner: session.user.id,
            status: 'DELIVERED',
            ...dateFilter,
        };

        const orders = await Order.find(query)
            .select('items deliveredAt finalAmount orderNumber')
            .sort({ deliveredAt: -1 });

        // Calculate earnings
        const earnings = calculateTotalEarnings(orders);

        // Get recent deliveries for display
        const recentDeliveries = orders.slice(0, 10).map(order => {
            const { calculateOrderEarnings } = require('@/lib/earningsCalculator');
            const orderEarnings = calculateOrderEarnings(order);

            return {
                orderNumber: order.orderNumber,
                deliveredAt: order.deliveredAt,
                itemCount: order.items.length,
                earnings: orderEarnings.totalEarning,
                orderTotal: order.finalAmount,
            };
        });

        return NextResponse.json({
            success: true,
            period,
            earnings,
            recentDeliveries,
        });
    } catch (error) {
        console.error('Error fetching delivery earnings:', error);
        return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
    }
}
