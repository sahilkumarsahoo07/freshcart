'use client';

import Link from 'next/link';
import { ShoppingBag, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 max-w-lg w-full text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner font-black">
                    404
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-gray-900">Oops! Page Not Found</h1>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                        The page or grocery item you are looking for might have been moved, renamed, or is temporarily unavailable.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                        href="/"
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        <span>Return to Home</span>
                    </Link>
                    <Link
                        href="/products"
                        className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-6 py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Browse Shop</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
