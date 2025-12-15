import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

// POST - Reset password with token
export async function POST(request) {
    try {
        await connectDB();

        const { token, newPassword } = await request.json();

        console.log('=== Reset Password Request ===');
        console.log('Token provided:', token ? 'Yes' : 'No');
        console.log('Token length:', token?.length);
        console.log('New password provided:', newPassword ? 'Yes' : 'No');

        if (!token || !newPassword) {
            console.log('ERROR: Missing token or password');
            return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            console.log('ERROR: Password too short');
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Hash the token to compare with stored hash
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
        console.log('Token hash generated');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            console.log('ERROR: No user found with valid token');

            // Check if token exists but is expired
            const expiredUser = await User.findOne({ resetPasswordToken: resetTokenHash });
            if (expiredUser) {
                console.log('Token found but expired');
                console.log('Expiry time:', expiredUser.resetPasswordExpire);
                console.log('Current time:', Date.now());
                return NextResponse.json({
                    error: 'Reset token has expired. Please request a new password reset.'
                }, { status: 400 });
            }

            console.log('Token not found in database');
            return NextResponse.json({
                error: 'Invalid reset token. Please request a new password reset.'
            }, { status: 400 });
        }

        console.log('User found:', user.email);

        // Update password
        user.password = newPassword; // Will be hashed by pre-save hook
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        console.log('Password reset successful for:', user.email);

        return NextResponse.json({
            message: 'Password reset successful. You can now login with your new password.'
        });

    } catch (error) {
        console.error('EXCEPTION in reset password:', error);
        return NextResponse.json({
            error: 'Failed to reset password: ' + error.message
        }, { status: 500 });
    }
}
