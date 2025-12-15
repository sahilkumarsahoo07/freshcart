import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Get delivery partner's assigned orders
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'DELIVERY') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = { assignedDeliveryPartner: session.user.id };

        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(50);

        // Get stats
        const stats = {
            total: await Order.countDocuments({ assignedDeliveryPartner: session.user.id }),
            pending: await Order.countDocuments({ assignedDeliveryPartner: session.user.id, status: { $in: ['CONFIRMED', 'PREPARING'] } }),
            active: await Order.countDocuments({ assignedDeliveryPartner: session.user.id, status: 'OUT_FOR_DELIVERY' }),
            completed: await Order.countDocuments({ assignedDeliveryPartner: session.user.id, status: 'DELIVERED' }),
        };

        return NextResponse.json({ orders, stats });
    } catch (error) {
        console.error('Error fetching delivery orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
