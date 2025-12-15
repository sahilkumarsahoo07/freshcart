import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Address from '@/models/Address';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// PUT /api/user/addresses/[id] - Update an existing address
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const { label, fullName, phone, street, landmark, city, state, pincode, latitude, longitude, formattedAddress, isDefault } = body;

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the address and verify it belongs to the user
        const address = await Address.findOne({ _id: id, user: user._id });

        if (!address) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        // If setting as default, unset other default addresses
        if (isDefault && !address.isDefault) {
            await Address.updateMany({ user: user._id, isDefault: true }, { isDefault: false });
        }

        // Update address fields
        if (label !== undefined) address.label = label;
        if (fullName !== undefined) address.fullName = fullName;
        if (phone !== undefined) address.phone = phone;
        if (street !== undefined) address.street = street;
        if (landmark !== undefined) address.landmark = landmark;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (pincode !== undefined) address.pincode = pincode;
        if (latitude !== undefined) address.latitude = latitude;
        if (longitude !== undefined) address.longitude = longitude;
        if (formattedAddress !== undefined) address.formattedAddress = formattedAddress;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await address.save();

        return NextResponse.json({ address }, { status: 200 });
    } catch (error) {
        console.error('Error updating address:', error);
        return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
    }
}

// DELETE /api/user/addresses/[id] - Delete an address
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the address and verify it belongs to the user
        const address = await Address.findOne({ _id: id, user: user._id });

        if (!address) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        // Delete the address
        await Address.deleteOne({ _id: id });

        // Remove address from user's addresses array
        user.addresses = user.addresses.filter((addrId) => addrId.toString() !== id);
        await user.save();

        return NextResponse.json({ message: 'Address deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting address:', error);
        return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
    }
}
