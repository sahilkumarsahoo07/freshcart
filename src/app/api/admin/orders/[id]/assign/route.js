import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// PUT - Assign delivery partner to order
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;
        const { deliveryPartnerId } = await request.json();

        if (!deliveryPartnerId) {
            return NextResponse.json({ error: 'Delivery partner ID is required' }, { status: 400 });
        }

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update order with delivery partner and change status to PREPARING
        order.deliveryPartner = deliveryPartnerId;
        order.status = 'PREPARING';
        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Delivery partner assigned successfully',
            order
        });
    } catch (error) {
        console.error('Error assigning delivery partner:', error);
        return NextResponse.json({ error: 'Failed to assign delivery partner' }, { status: 500 });
    }
}
