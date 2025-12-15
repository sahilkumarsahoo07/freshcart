import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login?callbackUrl=/admin', request.url));
        }

        if (token.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Protect delivery partner routes (except login/signup)
    if (pathname.startsWith('/delivery') && !pathname.startsWith('/delivery/login') && !pathname.startsWith('/delivery/signup')) {
        if (!token) {
            return NextResponse.redirect(new URL('/delivery/login', request.url));
        }

        if (token.role !== 'DELIVERY') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/delivery/:path*'],
};
