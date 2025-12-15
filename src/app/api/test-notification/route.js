import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { notifyNewOrder } from '@/lib/socket';

// POST - Test Socket.io notification
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get the most recent CONFIRMED order without delivery partner
    const order = await Order.findOne({ 
      status: 'CONFIRMED',
      assignedDeliveryPartner: null 
    }).sort({ createdAt: -1 });

    if (!order) {
      return NextResponse.json({ 
        error: 'No unassigned CONFIRMED orders found',
        message: 'Create an order first or check order status'
      }, { status: 404 });
    }

    console.log('🧪 TEST: Manually triggering notification for order:', order.orderNumber);
    
    // Trigger notification
    await notifyNewOrder(order);

    return NextResponse.json({
      success: true,
      message: 'Notification sent to all delivery partners',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Error in test notification:', error);
    return NextResponse.json({ 
      error: 'Failed to send test notification',
      message: error.message 
    }, { status: 500 });
  }
}
