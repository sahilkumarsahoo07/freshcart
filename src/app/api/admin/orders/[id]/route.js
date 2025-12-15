import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAvailableDeliveryPartner } from '@/lib/autoAssign';

// PUT - Update order status (Admin only)
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params; // Fixed: await params in Next.js 15
        const { status, assignedDeliveryPartner, notes } = await request.json();

        const updateData = {};
        if (status) updateData.status = status;
        if (assignedDeliveryPartner) updateData.assignedDeliveryPartner = assignedDeliveryPartner;
        if (notes) updateData.notes = notes;

        // Auto-assign delivery partner when confirming order
        if (status === 'CONFIRMED' && !assignedDeliveryPartner) {
            const autoAssignedPartner = await getAvailableDeliveryPartner();
            if (autoAssignedPartner) {
                updateData.assignedDeliveryPartner = autoAssignedPartner;
                updateData.status = 'PREPARING'; // Move directly to PREPARING
                console.log(`Order ${id} confirmed and auto-assigned to delivery partner`);
            }
        }

        // Set delivered/cancelled timestamps
        if (status === 'DELIVERED') {
            updateData.deliveredAt = new Date();
        } else if (status === 'CANCELLED') {
            updateData.cancelledAt = new Date();
        }

        // Find and update order
        const order = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('user', 'name email')
            .populate('assignedDeliveryPartner', 'name email phone');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Order updated successfully',
            order
        });

    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
