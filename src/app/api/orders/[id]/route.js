import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import DeliveryTracking from '@/models/DeliveryTracking';

// GET - Get single order details along with initial tracking
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;
        const order = await Order.findById(id)
            .populate('user', 'name email')
            .populate('assignedDeliveryPartner', 'name phone email');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if order belongs to user, delivery partner, or admin
        const isUser = order.user?._id?.toString() === session.user.id;
        const isPartner = order.assignedDeliveryPartner?._id?.toString() === session.user.id;
        const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'DELIVERY';

        if (!isUser && !isPartner && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch live tracking record for this order in the initial API payload
        const tracking = await DeliveryTracking.findOne({ order: id }).lean();

        return NextResponse.json({
            success: true,
            order,
            tracking: tracking || null
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
