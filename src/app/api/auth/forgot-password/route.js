import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

// POST - Request password reset
export async function POST(request) {
    try {
        await connectDB();

        const { email } = await request.json();

        console.log('=== Forgot Password Request ===');
        console.log('Email:', email);

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found, but returning success for security');
            // Don't reveal if user exists or not for security
            return NextResponse.json({
                message: 'If an account exists with this email, you will receive a password reset link.'
            });
        }

        console.log('User found:', user.email);

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        console.log('Reset token generated');
        console.log('Token length:', resetToken.length);
        console.log('Token hash:', resetTokenHash);

        // Set token and expiry (1 hour)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

        console.log('Saving user with reset token...');
        await user.save();
        console.log('User saved successfully');

        // Verify the token was saved
        const verifyUser = await User.findById(user._id);
        console.log('Verification - Token saved:', verifyUser.resetPasswordToken ? 'Yes' : 'No');
        console.log('Verification - Expiry saved:', verifyUser.resetPasswordExpire ? 'Yes' : 'No');

        // In production, send email with reset link
        // For now, we'll just return the token (in production, this would be sent via email)
        const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        console.log('Reset URL generated:', resetUrl);

        // TODO: Send email with resetUrl
        // For development, we'll return it in the response
        return NextResponse.json({
            message: 'Password reset link sent to your email',
            resetUrl, // Remove this in production
            debug: {
                tokenSaved: !!verifyUser.resetPasswordToken,
                expirySaved: !!verifyUser.resetPasswordExpire
            }
        });

    } catch (error) {
        console.error('EXCEPTION in forgot password:', error);
        return NextResponse.json({
            error: 'Failed to process request: ' + error.message
        }, { status: 500 });
    }
}
