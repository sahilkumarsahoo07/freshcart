import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Get available unassigned orders for delivery partners
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'DELIVERY') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Find all CONFIRMED orders that don't have a delivery partner assigned
        const availableOrders = await Order.find({
            status: 'CONFIRMED',
            assignedDeliveryPartner: null
        })
            .sort({ createdAt: -1 })
            .limit(20);

        // Format orders for the frontend
        const formattedOrders = availableOrders.map(order => ({
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            items: order.items,
            deliveryAddress: order.deliveryAddress,
            finalAmount: order.finalAmount,
            createdAt: order.createdAt,
            status: order.status
        }));

        return NextResponse.json({
            success: true,
            orders: formattedOrders,
            count: formattedOrders.length
        });

    } catch (error) {
        console.error('Error fetching available orders:', error);
        return NextResponse.json({ error: 'Failed to fetch available orders' }, { status: 500 });
    }
}
