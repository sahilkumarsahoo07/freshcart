import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// PUT - Update order status by delivery partner
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'DELIVERY') {
            return NextResponse.json({ error: 'Unauthorized - Delivery partner access required' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;
        const { action } = await request.json();

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Auto-assign delivery partner if not assigned, or verify authorization
        if (!order.assignedDeliveryPartner) {
            order.assignedDeliveryPartner = session.user.id;
        } else if (order.assignedDeliveryPartner.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized for this order' }, { status: 403 });
        }

        // Update status based on action
        let newStatus;
        switch (action) {
            case 'reached_store':
                newStatus = 'REACHED_STORE';
                break;
            case 'pickup':
                newStatus = 'OUT_FOR_DELIVERY';
                break;
            case 'arrived_at_customer':
                newStatus = 'ARRIVED_AT_CUSTOMER';
                break;
            case 'deliver':
                newStatus = 'DELIVERED';
                order.deliveredAt = new Date();
                if (order.paymentMethod === 'COD') {
                    order.paymentStatus = 'COMPLETED';
                }
                break;
            default:
                return NextResponse.json({ error: 'Invalid action name' }, { status: 400 });
        }

        order.status = newStatus;
        await order.save();

        // Broadcast real-time Socket notification to customer
        try {
            const { notifyOrderStatusUpdate } = await import('@/lib/socket');
            if (notifyOrderStatusUpdate) {
                notifyOrderStatusUpdate(order);
            }
        } catch (e) {
            console.log('Socket notification notice:', e.message);
        }

        return NextResponse.json({
            success: true,
            message: `Order status updated to ${newStatus}`,
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
    }
}
