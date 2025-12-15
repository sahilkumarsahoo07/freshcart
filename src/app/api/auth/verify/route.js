import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';

export async function POST(request) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Please provide email and OTP' },
                { status: 400 }
            );
        }

        await connectDB();

        // 1. Check if user is already verified (in main User table)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'User already verified' },
                { status: 200 }
            );
        }

        // 2. Find in PendingUser
        const pendingUser = await PendingUser.findOne({ email });

        if (!pendingUser) {
            return NextResponse.json(
                { error: 'Verification session expired or invalid. Please sign up again.' },
                { status: 404 }
            );
        }

        // 3. Check OTP
        if (pendingUser.otp !== otp) {
            return NextResponse.json(
                { error: 'Invalid OTP' },
                { status: 400 }
            );
        }

        // 4. Create real User
        // Note: passing plain password triggers User model pre-save hash
        const newUser = await User.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            phone: pendingUser.phone,
            role: pendingUser.role,
            isVerified: true,
        });

        // 5. Delete pending record
        await PendingUser.deleteOne({ _id: pendingUser._id });

        return NextResponse.json(
            { message: 'Account verified successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
