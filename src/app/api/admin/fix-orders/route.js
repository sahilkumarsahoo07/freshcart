import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

// POST - Fix existing orders by assigning them to delivery partners
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get all delivery partners
        const deliveryPartners = await User.find({ role: 'DELIVERY' });

        if (deliveryPartners.length === 0) {
            return NextResponse.json({
                error: 'No delivery partners found. Please create a delivery partner user first.',
                instructions: 'Go to /admin/users and create a user with role DELIVERY'
            }, { status: 400 });
        }

        // Get all unassigned orders
        const unassignedOrders = await Order.find({
            assignedDeliveryPartner: null,
            status: { $in: ['PLACED', 'CONFIRMED'] }
        });

        if (unassignedOrders.length === 0) {
            return NextResponse.json({
                message: 'No unassigned orders found',
                deliveryPartnersCount: deliveryPartners.length
            });
        }

        // Assign orders to delivery partners (round-robin)
        const updates = [];
        for (let i = 0; i < unassignedOrders.length; i++) {
            const order = unassignedOrders[i];
            const partner = deliveryPartners[i % deliveryPartners.length];

            order.assignedDeliveryPartner = partner._id;
            order.status = 'PREPARING';
            await order.save();

            updates.push({
                orderNumber: order.orderNumber,
                assignedTo: partner.name,
                newStatus: 'PREPARING'
            });
        }

        return NextResponse.json({
            success: true,
            message: `Assigned ${updates.length} orders to ${deliveryPartners.length} delivery partner(s)`,
            updates
        });

    } catch (error) {
        console.error('Error fixing orders:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
