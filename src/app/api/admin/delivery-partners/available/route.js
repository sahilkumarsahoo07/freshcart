import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET - Get available delivery partners
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get all users with DELIVERY role
        const deliveryPartners = await User.find({ role: 'DELIVERY' })
            .select('name email phone')
            .sort({ name: 1 });

        return NextResponse.json({ deliveryPartners });
    } catch (error) {
        console.error('Error fetching delivery partners:', error);
        return NextResponse.json({ error: 'Failed to fetch delivery partners' }, { status: 500 });
    }
}
