import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Address from '@/models/Address';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// PATCH /api/user/addresses/[id]/default - Set address as default
export async function PATCH(req, { params }) {
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

        // Unset all other default addresses for this user
        await Address.updateMany(
            { user: user._id, isDefault: true },
            { isDefault: false }
        );

        // Set this address as default
        address.isDefault = true;
        await address.save();

        return NextResponse.json({ address }, { status: 200 });
    } catch (error) {
        console.error('Error setting default address:', error);
        return NextResponse.json({ error: 'Failed to set default address' }, { status: 500 });
    }
}
