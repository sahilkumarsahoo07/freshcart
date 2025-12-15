import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Address from '@/models/Address';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/user/addresses - Fetch all addresses for the authenticated user
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email }).populate('addresses');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ addresses: user.addresses || [] }, { status: 200 });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }
}

// POST /api/user/addresses - Create a new address
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { label, fullName, phone, street, landmark, city, state, pincode, latitude, longitude, formattedAddress, isDefault } = body;

        // Validate required fields
        if (!street || !city || !state || !pincode) {
            return NextResponse.json(
                { error: 'Street, city, state, and pincode are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If this is set as default, unset other default addresses
        if (isDefault) {
            await Address.updateMany({ user: user._id, isDefault: true }, { isDefault: false });
        }

        // Create new address
        const newAddress = await Address.create({
            user: user._id,
            label: label || 'HOME',
            fullName,
            phone,
            street,
            landmark,
            city,
            state,
            pincode,
            latitude,
            longitude,
            formattedAddress,
            isDefault: isDefault || false,
        });

        // Add address to user's addresses array
        user.addresses.push(newAddress._id);
        await user.save();

        return NextResponse.json({ address: newAddress }, { status: 201 });
    } catch (error) {
        console.error('Error creating address:', error);
        return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
    }
}
