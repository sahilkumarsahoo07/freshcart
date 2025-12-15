import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Debug admin orders
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        console.log('Session:', session);

        if (!session) {
            return NextResponse.json({ error: 'No session' }, { status: 401 });
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Not admin', role: session.user.role }, { status: 401 });
        }

        await connectDB();

        const allOrders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: allOrders.length,
            orders: allOrders.map(o => ({
                _id: o._id,
                orderNumber: o.orderNumber,
                customer: o.user?.name,
                status: o.status,
                finalAmount: o.finalAmount,
                assignedDeliveryPartner: o.assignedDeliveryPartner,
                createdAt: o.createdAt
            }))
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
