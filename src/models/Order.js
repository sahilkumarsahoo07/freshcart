import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: String,
                price: Number,
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                image: String,
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryFee: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        finalAmount: {
            type: Number,
            required: true,
        },
        deliveryAddress: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            latitude: Number,
            longitude: Number,
        },
        paymentMethod: {
            type: String,
            enum: ['CARD', 'UPI', 'WALLET', 'COD'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
            default: 'PENDING',
        },
        paymentDetails: {
            transactionId: String,
            paidAt: Date,
        },
        status: {
            type: String,
            enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
            default: 'PLACED',
        },
        assignedDeliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        trackingData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        estimatedDeliveryTime: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
        cancellationReason: {
            type: String,
        },
        notes: {
            type: String,
        },
        requiresConfirmation: {
            type: Boolean,
            default: false,
        },
        confirmationReason: {
            type: String,
        },
        confirmedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        confirmedAt: {
            type: Date,
        },
        rating: {
            productRating: {
                type: Number,
                min: 1,
                max: 5,
            },
            deliveryRating: {
                type: Number,
                min: 1,
                max: 5,
            },
            comment: {
                type: String,
                default: '',
            },
            createdAt: {
                type: Date,
            },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
