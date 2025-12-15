import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAvailableDeliveryPartner } from '@/lib/autoAssign';

// PUT - Confirm order
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'STORE_MANAGER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;
        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Confirm order and auto-assign delivery partner
        order.requiresConfirmation = false;
        order.confirmedBy = session.user.id;
        order.confirmedAt = new Date();
        order.status = 'CONFIRMED';

        // Auto-assign delivery partner
        const assignedPartnerId = await getAvailableDeliveryPartner();
        if (assignedPartnerId) {
            order.assignedDeliveryPartner = assignedPartnerId;
            order.status = 'PREPARING';
        } else {
            // No delivery partner available, notify all delivery partners
            try {
                const { notifyNewOrder } = await import('@/lib/socket');
                notifyNewOrder(order);
            } catch (error) {
                console.log('Socket.io not available, skipping notification');
            }
        }

        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Order confirmed successfully',
            order
        });
    } catch (error) {
        console.error('Error confirming order:', error);
        return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 });
    }
}
