import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter email and password');
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user) {
                    throw new Error('No user found with this email');
                }

                const isPasswordValid = await user.comparePassword(credentials.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === 'google') {
                try {
                    await connectDB();

                    // Check if user already exists
                    let existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        // Create new user from Google profile
                        existingUser = await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            role: 'CUSTOMER', // Default role for Google sign-ups
                            password: Math.random().toString(36).slice(-8), // Random password (won't be used)
                            emailVerified: true, // Google emails are pre-verified
                        });
                        console.log('✅ New Google user created:', existingUser.email);
                    } else {
                        // Update existing user's image if changed
                        if (existingUser.image !== user.image) {
                            existingUser.image = user.image;
                            await existingUser.save();
                        }
                        console.log('✅ Existing Google user logged in:', existingUser.email);
                    }

                    // Update user object with database ID and role
                    user.id = existingUser._id.toString();
                    user.role = existingUser.role;

                    return true;
                } catch (error) {
                    console.error('❌ Google sign-in error:', error);
                    return false;
                }
            }
            return true; // Allow credentials provider to continue
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.image = user.image;
            }

            // Update token when session is updated
            if (trigger === 'update' && session?.image) {
                token.image = session.image;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.image = token.image;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
