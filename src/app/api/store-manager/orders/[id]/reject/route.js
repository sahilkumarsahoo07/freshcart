import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

// PUT - Reject order
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'STORE_MANAGER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;
        const { reason } = await request.json();

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Reject order and refund stock
        order.status = 'CANCELLED';
        order.cancelledAt = new Date();
        order.cancellationReason = reason || 'Rejected by store manager due to insufficient stock';

        // Refund stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Order rejected successfully',
            order
        });
    } catch (error) {
        console.error('Error rejecting order:', error);
        return NextResponse.json({ error: 'Failed to reject order' }, { status: 500 });
    }
}
