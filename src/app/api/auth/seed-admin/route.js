import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        await connectDB();

        let admin = await User.findOne({ email: 'admin@freshcart.com' });

        if (!admin) {
            admin = await User.create({
                name: 'System Admin',
                email: 'admin@freshcart.com',
                password: 'admin123',
                role: 'ADMIN',
                emailVerified: true,
                isVerified: true
            });
            return NextResponse.json({
                message: 'Admin account created successfully!',
                email: 'admin@freshcart.com',
                password: 'admin123',
                role: 'ADMIN'
            });
        } else {
            admin.role = 'ADMIN';
            admin.password = 'admin123';
            await admin.save();
            return NextResponse.json({
                message: 'Admin account updated successfully!',
                email: 'admin@freshcart.com',
                password: 'admin123',
                role: 'ADMIN'
            });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
