import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const { name, email, password, role, phone } = await request.json();

        if (!name || !email || !password || !phone) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        const validRoles = ['CUSTOMER', 'DELIVERY'];
        if (role && !validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role selection' },
                { status: 400 }
            );
        }

        const userRole = role || 'CUSTOMER';

        await connectDB();

        // Check if user already exists in main User collection
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 400 }
            );
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // DEV ONLY: Log OTP to console for testing
        console.log('================================================');
        console.log('DEV VERIFICATION OTP:', otp);
        console.log('================================================');

        // Check if there is already a pending registration for this email, if so update it
        await PendingUser.findOneAndDelete({ email });

        await PendingUser.create({
            name,
            email,
            password, // Stored as plain text temporarily, will be hashed when moving to User
            phone,
            role: userRole,
            otp,
        });

        // Send OTP via Nodemailer
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: '"FreshCart - Grocery Delivery" <' + process.env.EMAIL_USER + '>',
                to: email,
                subject: '🛒 Verify Your FreshCart Account - OTP Inside',
                html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your FreshCart Account</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <!-- Main Container -->
                                <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                                    
                                    <!-- Header with Logo -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 40px 30px; text-align: center;">
                                            <div style="background: white; width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.2);">
                                                <span style="font-size: 40px;">🛒</span>
                                            </div>
                                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">FreshCart</h1>
                                            <p style="margin: 10px 0 0; color: #e8f5e9; font-size: 16px; font-weight: 300;">Fresh Groceries, Delivered Fast</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Welcome Message -->
                                    <tr>
                                        <td style="padding: 40px 30px 20px;">
                                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 28px; font-weight: 600; text-align: center;">
                                                Welcome to FreshCart! 🎉
                                            </h2>
                                            <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                                                Hi <strong>${name}</strong>,
                                            </p>
                                            <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                                                Thank you for joining FreshCart! We're excited to have you on board. To complete your registration, please verify your email address using the code below.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- OTP Code Box -->
                                    <tr>
                                        <td style="padding: 0 30px 30px;">
                                            <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 15px; padding: 30px; text-align: center; border: 3px dashed #4CAF50;">
                                                <p style="margin: 0 0 15px; color: #555555; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                                    Your Verification Code
                                                </p>
                                                <div style="background: #ffffff; border-radius: 10px; padding: 20px; margin: 0 auto; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                                                    <h1 style="margin: 0; color: #4CAF50; font-size: 48px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                                                        ${otp}
                                                    </h1>
                                                </div>
                                                <p style="margin: 20px 0 0; color: #666666; font-size: 14px;">
                                                    ⏱️ This code expires in <strong style="color: #f44336;">15 minutes</strong>
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Instructions -->
                                    <tr>
                                        <td style="padding: 0 30px 30px;">
                                            <div style="background: #f8f9fa; border-left: 4px solid #4CAF50; padding: 20px; border-radius: 8px;">
                                                <p style="margin: 0 0 10px; color: #333333; font-size: 15px; font-weight: 600;">
                                                    📋 How to verify:
                                                </p>
                                                <ol style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                                                    <li>Return to the FreshCart signup page</li>
                                                    <li>Enter the 6-digit code shown above</li>
                                                    <li>Click "Verify" to activate your account</li>
                                                </ol>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Security Notice -->
                                    <tr>
                                        <td style="padding: 0 30px 30px;">
                                            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px;">
                                                <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                                                    🔒 <strong>Security Tip:</strong> Never share this code with anyone. FreshCart will never ask for your verification code via phone or email.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Didn't Request Notice -->
                                    <tr>
                                        <td style="padding: 0 30px 30px;">
                                            <p style="margin: 0; color: #999999; font-size: 13px; text-align: center; line-height: 1.6;">
                                                If you didn't create a FreshCart account, please ignore this email or contact our support team.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                            <p style="margin: 0 0 15px; color: #666666; font-size: 14px; font-weight: 600;">
                                                Need help? We're here for you!
                                            </p>
                                            <p style="margin: 0 0 20px; color: #999999; font-size: 13px;">
                                                📧 support@freshcart.com | 📞 1-800-FRESH-CART
                                            </p>
                                            <div style="margin: 20px 0;">
                                                <a href="#" style="display: inline-block; margin: 0 10px; color: #4CAF50; text-decoration: none; font-size: 24px;">📱</a>
                                                <a href="#" style="display: inline-block; margin: 0 10px; color: #4CAF50; text-decoration: none; font-size: 24px;">🐦</a>
                                                <a href="#" style="display: inline-block; margin: 0 10px; color: #4CAF50; text-decoration: none; font-size: 24px;">📘</a>
                                                <a href="#" style="display: inline-block; margin: 0 10px; color: #4CAF50; text-decoration: none; font-size: 24px;">📷</a>
                                            </div>
                                            <p style="margin: 20px 0 0; color: #999999; font-size: 12px; line-height: 1.6;">
                                                © ${new Date().getFullYear()} FreshCart. All rights reserved.<br>
                                                Fresh Groceries, Delivered to Your Doorstep
                                            </p>
                                        </td>
                                    </tr>
                                    
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                `
            });
            console.log('OTP Email sent to:', email);

        } catch (emailError) {
            console.error('Error sending email:', emailError);
            console.error('EMAIL_USER present:', !!process.env.EMAIL_USER);
            console.error('EMAIL_PASS present:', !!process.env.EMAIL_PASS);
        }

        return NextResponse.json(
            {
                message: 'Registration successful. Please verify your account. (Data stored in temporary table)',
                requiresVerification: true,
                email: email
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
