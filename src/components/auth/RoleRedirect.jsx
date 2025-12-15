'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function RoleRedirect({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'DELIVERY') {
            // Delivery partners should only access /delivery routes
            if (!pathname.startsWith('/delivery') && pathname !== '/login' && pathname !== '/api') {
                router.push('/delivery');
            }
        }
    }, [session, status, pathname, router]);

    // Don't render customer pages for delivery partners
    if (status === 'authenticated' && session?.user?.role === 'DELIVERY') {
        if (!pathname.startsWith('/delivery') && pathname !== '/login') {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Redirecting to delivery dashboard...</p>
                    </div>
                </div>
            );
        }
    }

    return children;
}
