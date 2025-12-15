import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Get active orders for customer (not delivered/cancelled)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get orders that are not yet delivered or cancelled
        const orders = await Order.find({
            user: session.user.id,
            status: { $in: ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'] }
        })
            .populate('assignedDeliveryPartner', 'name phone')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching active orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
