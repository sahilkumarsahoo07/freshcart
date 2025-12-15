'use client';

import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import useCartStore from '@/store/useCartStore';

export default function FloatingCartBar() {
    const [isExpanded, setIsExpanded] = useState(false);
    const items = useCartStore((state) => state.items);
    const getTotal = useCartStore((state) => state.getTotal);
    const getCount = useCartStore((state) => state.getCount);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);

    const itemCount = getCount();
    const total = getTotal();

    if (itemCount === 0) return null;

    return (
        <>
            {/* Floating Cart Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 animate-slideUp">
                {/* Expanded Cart Preview */}
                {isExpanded && (
                    <div className="bg-white border-t shadow-2xl max-h-96 overflow-y-auto">
                        <div className="container mx-auto px-4 py-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg">Cart Items ({itemCount})</h3>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item) => {
                                    const finalPrice = item.product.discountPrice || item.product.price;
                                    return (
                                        <div
                                            key={item.product._id}
                                            className="flex items-center gap-4 bg-gray-50 rounded-lg p-3"
                                        >
                                            {/* Product Image */}
                                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                                                <Image
                                                    src={item.product.images[0] || '/placeholder-product.jpg'}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm text-gray-900 truncate">
                                                    {item.product.name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    ₹{finalPrice} × {item.quantity}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">
                                                    ₹{(finalPrice * item.quantity).toFixed(2)}
                                                </p>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeItem(item.product._id)}
                                                className="text-red-500 hover:text-red-700 transition"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Cart Bar */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-2xl">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            {/* Cart Summary */}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-4 hover:opacity-90 transition"
                            >
                                <div className="relative">
                                    <ShoppingCart className="w-8 h-8" />
                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                                        {itemCount}
                                    </span>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm opacity-90">
                                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                    </p>
                                    <p className="text-xl font-bold">₹{total.toFixed(2)}</p>
                                </div>
                            </button>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition backdrop-blur-sm"
                                >
                                    {isExpanded ? 'Hide' : 'View'} Cart
                                </button>
                                <Link
                                    href="/cart"
                                    className="px-8 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg"
                                >
                                    Checkout →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer to prevent content from being hidden behind the bar */}
            <div className="h-20"></div>

            <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
        </>
    );
}
