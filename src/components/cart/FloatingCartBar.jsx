'use client';

import { ShoppingCart, X, Plus, Minus, Trash2, Tag, Truck, CheckCircle } from 'lucide-react';
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
    const appliedCoupon = useCartStore((state) => state.appliedCoupon);
    const getDiscount = useCartStore((state) => state.getDiscount);

    const itemCount = getCount();
    const subtotal = getTotal();
    const discount = getDiscount();
    const finalTotal = Math.max(0, subtotal - discount);

    const freeDeliveryThreshold = 299;
    const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
    const progressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

    if (itemCount === 0) return null;

    return (
        <>
            {/* Floating Cart Container */}
            <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp font-sans">

                {/* Instamart-Style Free Shipping Progress Bar */}
                <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-emerald-700/50 shadow-inner">
                    <div className="flex items-center gap-2">
                        {amountNeededForFreeDelivery > 0 ? (
                            <>
                                <Truck className="w-4 h-4 text-yellow-300 animate-pulse flex-shrink-0" />
                                <span>Add <span className="font-black text-yellow-300">₹{amountNeededForFreeDelivery}</span> more for <span className="font-bold underline text-emerald-200">FREE Express Delivery</span></span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span className="font-black text-emerald-200">🎉 Congratulations! FREE Express 10-Min Delivery Unlocked</span>
                            </>
                        )}
                    </div>

                    <div className="w-24 sm:w-32 bg-black/30 h-2 rounded-full overflow-hidden ml-2 flex-shrink-0 border border-white/20">
                        <div
                            className="bg-gradient-to-r from-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                {/* Expanded Item Tray */}
                {isExpanded && (
                    <div className="bg-white border-t border-gray-200 shadow-2xl max-h-96 overflow-y-auto">
                        <div className="container mx-auto px-4 py-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-gray-900 text-base">Your Instamart Basket</h3>
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2 py-0.5 rounded-full">
                                        {itemCount} Items
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                {items.map((item) => {
                                    const finalPrice = item.product.discountPrice || item.product.price;
                                    return (
                                        <div
                                            key={item.product._id}
                                            className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-3 hover:bg-gray-100/80 transition"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-12 h-12 relative flex-shrink-0 rounded-xl bg-white p-1 border border-gray-100 overflow-hidden">
                                                    <Image
                                                        src={item.product.images?.[0] || '/placeholder-product.jpg'}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover rounded-lg"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-xs text-gray-900 truncate">
                                                        {item.product.name}
                                                    </h4>
                                                    <p className="text-[11px] text-gray-500 font-medium">
                                                        ₹{finalPrice} × {item.quantity}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                                                    <button
                                                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-black text-gray-900">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="text-right min-w-[60px]">
                                                    <p className="font-black text-xs text-gray-900">
                                                        ₹{(finalPrice * item.quantity).toFixed(0)}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.product._id)}
                                                    className="text-gray-400 hover:text-rose-600 transition p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {appliedCoupon && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-emerald-800">
                                    <span className="flex items-center gap-1.5">
                                        <Tag className="w-4 h-4 text-emerald-600" />
                                        Coupon Applied: {appliedCoupon.code}
                                    </span>
                                    <span className="text-emerald-700 font-black">-₹{discount} OFF</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Floating Strip */}
                <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white shadow-2xl">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-3.5 hover:opacity-95 transition text-left"
                            >
                                <div className="relative bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/20">
                                    <ShoppingCart className="w-6 h-6 text-white" />
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center text-[10px] font-black shadow">
                                        {itemCount}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-semibold opacity-90">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                                        {discount > 0 && (
                                            <span className="bg-yellow-400 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                                                Saved ₹{discount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-lg font-black tracking-tight text-white">
                                        ₹{finalTotal.toFixed(0)}
                                    </p>
                                </div>
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="hidden sm:inline-flex px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl font-bold text-xs transition backdrop-blur-md border border-white/20"
                                >
                                    {isExpanded ? 'Hide Items' : 'View Basket'}
                                </button>
                                <Link
                                    href="/checkout"
                                    className="px-6 py-2.5 bg-white hover:bg-gray-100 text-emerald-800 rounded-xl font-black text-xs transition shadow-lg flex items-center gap-1.5"
                                >
                                    <span>Proceed to Checkout</span>
                                    <span className="text-emerald-600 font-bold">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-24"></div>

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
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
        </>
    );
}
