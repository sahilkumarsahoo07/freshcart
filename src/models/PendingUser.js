import mongoose from 'mongoose';

const PendingUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true, // Only one pending registration per email
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expireAt: {
            type: Date,
            default: Date.now,
            index: { expires: '15m' }, // Auto-delete after 15 minutes
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.PendingUser || mongoose.model('PendingUser', PendingUserSchema);
