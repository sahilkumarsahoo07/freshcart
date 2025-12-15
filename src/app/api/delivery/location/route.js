import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import DeliveryTracking from '@/models/DeliveryTracking';
import Order from '@/models/Order';

// GET - Get delivery tracking for an order
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        await connectDB();

        const tracking = await DeliveryTracking.findOne({ order: orderId })
            .populate('deliveryPartner', 'name phone image')
            .lean();

        if (!tracking) {
            return NextResponse.json({ error: 'Tracking information not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            tracking
        });
    } catch (error) {
        console.error('Error fetching tracking info:', error);
        return NextResponse.json({ error: 'Failed to fetch tracking information' }, { status: 500 });
    }
}

// POST - Update delivery partner location
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only delivery partners can update location
        if (session.user.role !== 'DELIVERY') {
            return NextResponse.json({ error: 'Only delivery partners can update location' }, { status: 403 });
        }

        await connectDB();

        const { orderId, latitude, longitude } = await request.json();

        if (!orderId || !latitude || !longitude) {
            return NextResponse.json({
                error: 'Order ID, latitude, and longitude are required'
            }, { status: 400 });
        }

        // Verify the delivery partner is assigned to this order
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.assignedDeliveryPartner?.toString() !== session.user.id) {
            return NextResponse.json({
                error: 'You are not assigned to this order'
            }, { status: 403 });
        }

        // Update or create tracking record
        let tracking = await DeliveryTracking.findOne({ order: orderId });

        const newLocation = { latitude, longitude };

        if (tracking) {
            // Update existing tracking
            tracking.currentLocation = newLocation;
            tracking.locationHistory.push({
                latitude,
                longitude,
                timestamp: new Date(),
            });

            // Calculate distance to customer (simple Haversine formula)
            const customerLat = order.deliveryAddress?.latitude || 19.0760;
            const customerLng = order.deliveryAddress?.longitude || 72.8777;
            const distance = calculateDistance(latitude, longitude, customerLat, customerLng);
            tracking.distanceRemaining = distance;

            // Estimate arrival time (assuming 20 km/h average speed)
            const hoursRemaining = distance / 20;
            const minutesRemaining = Math.ceil(hoursRemaining * 60);
            tracking.estimatedArrival = new Date(Date.now() + minutesRemaining * 60000);

            // Update status based on distance
            if (distance < 0.5) {
                tracking.status = 'NEARBY';
            } else if (order.status === 'OUT_FOR_DELIVERY') {
                tracking.status = 'IN_TRANSIT';
            }

            await tracking.save();
        } else {
            // Create new tracking record
            const customerLat = order.deliveryAddress?.latitude || 19.0760;
            const customerLng = order.deliveryAddress?.longitude || 72.8777;
            const distance = calculateDistance(latitude, longitude, customerLat, customerLng);
            const hoursRemaining = distance / 20;
            const minutesRemaining = Math.ceil(hoursRemaining * 60);

            tracking = await DeliveryTracking.create({
                order: orderId,
                deliveryPartner: session.user.id,
                currentLocation: newLocation,
                locationHistory: [{
                    latitude,
                    longitude,
                    timestamp: new Date(),
                }],
                status: distance < 0.5 ? 'NEARBY' : 'IN_TRANSIT',
                distanceRemaining: distance,
                estimatedArrival: new Date(Date.now() + minutesRemaining * 60000),
            });
        }

        // Emit Socket.io event to notify customer
        try {
            const { updateDeliveryLocation } = await import('@/lib/socket');
            updateDeliveryLocation(orderId, {
                location: newLocation,
                distanceRemaining: tracking.distanceRemaining,
                estimatedArrival: tracking.estimatedArrival,
                status: tracking.status,
            });
        } catch (error) {
            console.log('Socket.io not available, skipping real-time notification');
        }

        return NextResponse.json({
            success: true,
            message: 'Location updated successfully',
            tracking: {
                currentLocation: tracking.currentLocation,
                distanceRemaining: tracking.distanceRemaining,
                estimatedArrival: tracking.estimatedArrival,
                status: tracking.status,
            },
        });
    } catch (error) {
        console.error('Error updating location:', error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
