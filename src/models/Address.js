import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        label: {
            type: String,
            enum: ['HOME', 'WORK', 'OTHER'],
            default: 'HOME',
        },
        street: {
            type: String,
            required: true,
        },
        landmark: {
            type: String,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
            // Contact person name for this address
        },
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^\d{10}$/.test(v);
                },
                message: 'Phone number must be 10 digits'
            }
            // Contact phone for this address
        },
        formattedAddress: {
            type: String,
            // Full formatted address from Google Maps
        },
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);
