import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Auto-assign a delivery partner to an order
 * Uses round-robin algorithm to distribute orders evenly
 */
export async function autoAssignDeliveryPartner() {
    try {
        await connectDB();

        // Get all delivery partners
        const deliveryPartners = await User.find({ role: 'DELIVERY' })
            .select('_id name')
            .sort({ name: 1 });

        if (deliveryPartners.length === 0) {
            console.log('No delivery partners available for auto-assignment');
            return null;
        }

        // Simple round-robin: pick a random delivery partner
        // In production, you could track assignment counts and pick the one with least orders
        const randomIndex = Math.floor(Math.random() * deliveryPartners.length);
        const selectedPartner = deliveryPartners[randomIndex];

        console.log(`Auto-assigned to delivery partner: ${selectedPartner.name}`);
        return selectedPartner._id;

    } catch (error) {
        console.error('Error in auto-assignment:', error);
        return null;
    }
}

/**
 * Get the delivery partner with the least active orders (better algorithm)
 */
export async function getAvailableDeliveryPartner() {
    try {
        await connectDB();

        const Order = (await import('@/models/Order')).default;

        // Get all delivery partners
        const deliveryPartners = await User.find({ role: 'DELIVERY' })
            .select('_id name');

        if (deliveryPartners.length === 0) {
            return null;
        }

        // Count active orders for each delivery partner
        const partnerCounts = await Promise.all(
            deliveryPartners.map(async (partner) => {
                const activeOrders = await Order.countDocuments({
                    deliveryPartner: partner._id,
                    status: { $in: ['PREPARING', 'OUT_FOR_DELIVERY'] }
                });
                return { partnerId: partner._id, name: partner.name, activeOrders };
            })
        );

        // Sort by least active orders
        partnerCounts.sort((a, b) => a.activeOrders - b.activeOrders);

        // Return the partner with least active orders
        const selectedPartner = partnerCounts[0];
        console.log(`Auto-assigned to ${selectedPartner.name} (${selectedPartner.activeOrders} active orders)`);

        return selectedPartner.partnerId;

    } catch (error) {
        console.error('Error getting available delivery partner:', error);
        return null;
    }
}
