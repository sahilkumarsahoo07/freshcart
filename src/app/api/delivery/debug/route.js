import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Debug endpoint to check delivery partner orders
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'DELIVERY') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get all orders (for debugging)
        const allOrders = await Order.find({})
            .select('orderNumber assignedDeliveryPartner deliveryPartner status')
            .lean();

        // Get orders assigned to this delivery partner
        const myOrders = await Order.find({ assignedDeliveryPartner: session.user.id })
            .populate('user', 'name email phone')
            .lean();

        return NextResponse.json({
            deliveryPartnerId: session.user.id,
            totalOrdersInDB: allOrders.length,
            myOrdersCount: myOrders.length,
            allOrders: allOrders.map(o => ({
                orderNumber: o.orderNumber,
                assignedDeliveryPartner: o.assignedDeliveryPartner,
                deliveryPartner: o.deliveryPartner,
                status: o.status
            })),
            myOrders: myOrders.map(o => ({
                orderNumber: o.orderNumber,
                customer: o.user?.name,
                status: o.status
            }))
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
