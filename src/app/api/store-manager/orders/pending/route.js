import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Get orders requiring confirmation
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'STORE_MANAGER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const pendingOrders = await Order.find({ requiresConfirmation: true, status: 'PLACED' })
            .populate('user', 'name email phone')
            .populate('items.product', 'name images stock')
            .sort({ createdAt: -1 });

        return NextResponse.json({ orders: pendingOrders });
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
