import mongoose from 'mongoose';

const DeliveryTrackingSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
            unique: true,
        },
        deliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        currentLocation: {
            latitude: {
                type: Number,
                required: true,
            },
            longitude: {
                type: Number,
                required: true,
            },
        },
        locationHistory: [
            {
                latitude: Number,
                longitude: Number,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        status: {
            type: String,
            enum: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'NEARBY', 'DELIVERED'],
            default: 'ASSIGNED',
        },
        estimatedArrival: {
            type: Date,
        },
        distanceRemaining: {
            type: Number, // in kilometers
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.DeliveryTracking || mongoose.model('DeliveryTracking', DeliveryTrackingSchema);
