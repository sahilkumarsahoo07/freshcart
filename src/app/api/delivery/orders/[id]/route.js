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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;
        const { action } = await request.json();

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if order is assigned to this delivery partner
        if (order.assignedDeliveryPartner?.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized for this order' }, { status: 403 });
        }

        // Update status based on action
        let newStatus;
        switch (action) {
            case 'pickup':
                if (order.status !== 'PREPARING') {
                    return NextResponse.json({ error: 'Order not ready for pickup' }, { status: 400 });
                }
                newStatus = 'OUT_FOR_DELIVERY';
                break;
            case 'deliver':
                if (order.status !== 'OUT_FOR_DELIVERY') {
                    return NextResponse.json({ error: 'Order not out for delivery' }, { status: 400 });
                }
                newStatus = 'DELIVERED';
                order.deliveredAt = new Date();
                if (order.paymentMethod === 'COD') {
                    order.paymentStatus = 'COMPLETED'; // Changed from PAID to COMPLETED to match enum
                }
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        order.status = newStatus;
        await order.save();

        return NextResponse.json({
            success: true,
            message: `Order ${action === 'pickup' ? 'picked up' : 'delivered'} successfully`,
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
