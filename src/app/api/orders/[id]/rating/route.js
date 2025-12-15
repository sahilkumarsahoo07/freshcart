import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// POST - Submit rating for order
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;
        const { productRating, deliveryRating, comment } = await request.json();

        // Validate ratings
        if (!productRating || !deliveryRating || productRating < 1 || productRating > 5 || deliveryRating < 1 || deliveryRating > 5) {
            return NextResponse.json({
                error: 'Invalid ratings. Both ratings must be between 1 and 5'
            }, { status: 400 });
        }

        // Find order and verify ownership
        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.user.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check if order is delivered
        if (order.status !== 'DELIVERED') {
            return NextResponse.json({
                error: 'Can only rate delivered orders'
            }, { status: 400 });
        }

        // Check if already rated
        if (order.rating) {
            return NextResponse.json({
                error: 'Order already rated'
            }, { status: 400 });
        }

        // Add rating to order
        order.rating = {
            productRating,
            deliveryRating,
            comment: comment || '',
            createdAt: new Date(),
        };

        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Rating submitted successfully',
            rating: order.rating,
        });
    } catch (error) {
        console.error('Error submitting rating:', error);
        return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
    }
}
