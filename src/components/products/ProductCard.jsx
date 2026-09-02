'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, Eye, Plus, Minus, Zap, Clock } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onQuickView }) {
    const [mounted, setMounted] = useState(false);
    const items = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const toggleWishlist = useWishlistStore((state) => state.toggleItem);
    const isInWishlist = useWishlistStore((state) => state.isInWishlist(product._id));

    useEffect(() => {
        setMounted(true);
    }, []);

    // Subscribe to items array so component re-renders instantly on cart updates
    const cartItem = items.find((item) => item.product._id === product._id);
    const cartQty = mounted && cartItem ? cartItem.quantity : 0;
    const inCart = cartQty > 0;

    const discount = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const finalPrice = product.discountPrice || product.price;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock === 0) return;
        addItem(product, 1);
        toast.success(`Added ${product.name} to cart!`);
    };

    const handleIncrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product._id, cartQty + 1);
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product._id, cartQty - 1);
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleWishlist(product);
        if (added) {
            toast.success(`Saved to wishlist!`);
        } else {
            toast.success(`Removed from wishlist`);
        }
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onQuickView) {
            onQuickView(product);
        }
    };

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1 relative font-sans">
            {/* Image & Badges */}
            <div
                onClick={handleQuickView}
                className="relative aspect-square bg-gradient-to-b from-gray-50/50 to-emerald-50/20 overflow-hidden cursor-pointer flex items-center justify-center p-3"
            >
                <Image
                    src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-500 p-2 rounded-xl"
                />

                {/* Instamart 10-Min Delivery Tag */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    <span className="bg-emerald-900/90 backdrop-blur-md text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-500/30">
                        <Zap className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        <span>10 MINS</span>
                    </span>

                    {discount > 0 && (
                        <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm w-max">
                            {discount}% OFF
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-md z-10 ${
                        isInWishlist
                            ? 'bg-rose-500 text-white scale-110'
                            : 'bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-rose-50'
                    }`}
                    title={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                    <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>

                {/* Quick View Button on Hover */}
                <button
                    onClick={handleQuickView}
                    className="absolute bottom-2 right-2 w-7 h-7 bg-white/95 text-emerald-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow hover:bg-emerald-600 hover:text-white z-10"
                    title="Quick Preview"
                >
                    <Eye className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Content Details */}
            <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5 bg-white">
                <div>
                    {/* Unit / Weight & Rating */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mb-1">
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">
                            {product.unitValue || 1} {product.unit || 'unit'}
                        </span>
                        {product.rating?.average > 0 && (
                            <div className="flex items-center gap-0.5 text-amber-600 font-black bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/50">
                                <Star className="w-2.5 h-2.5 fill-amber-500" />
                                <span>{product.rating.average.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h3
                        onClick={handleQuickView}
                        className="font-bold text-gray-900 text-xs md:text-sm line-clamp-2 leading-snug cursor-pointer hover:text-emerald-600 transition"
                    >
                        {product.name}
                    </h3>
                </div>

                {/* Price & Instamart Quantity Controller */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm md:text-base font-black text-gray-900">
                                ₹{finalPrice}
                            </span>
                            {product.discountPrice && (
                                <span className="text-[10px] text-gray-400 line-through font-medium">
                                    ₹{product.price}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Instamart Style + / - Add Button */}
                    {inCart ? (
                        <div className="flex items-center bg-emerald-700 text-white rounded-xl shadow-md p-0.5 border border-emerald-800">
                            <button
                                onClick={handleDecrement}
                                className="w-6 h-6 flex items-center justify-center hover:bg-emerald-800 rounded-lg transition"
                                title="Decrease quantity"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-black">
                                {cartQty}
                            </span>
                            <button
                                onClick={handleIncrement}
                                className="w-6 h-6 flex items-center justify-center hover:bg-emerald-800 rounded-lg transition"
                                title="Increase quantity"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all duration-200 flex items-center gap-1 shadow-sm ${
                                product.stock === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:shadow-md'
                            }`}
                        >
                            {product.stock === 0 ? (
                                <span>Sold Out</span>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>ADD</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
