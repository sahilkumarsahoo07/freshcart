'use client';

import { X, Plus, Minus, ShoppingCart, Star, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import useCartStore from '@/store/useCartStore';

export default function ProductQuickView({ product, isOpen, onClose }) {
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((state) => state.addItem);

    if (!isOpen || !product) return null;

    const discount = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;
    const finalPrice = product.discountPrice || product.price;

    const handleAddToCart = () => {
        addItem(product, quantity);
        setQuantity(1);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-slideUp"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition z-10"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>

                    <div className="grid md:grid-cols-2 gap-8 p-8">
                        {/* Product Image */}
                        <div className="relative">
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                <Image
                                    src={product.images[0] || '/placeholder-product.jpg'}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                                {discount > 0 && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                        {discount}% OFF
                                    </div>
                                )}
                            </div>

                            {/* Wishlist Button */}
                            <button className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition">
                                <Heart className="w-6 h-6 text-gray-600 hover:text-red-500 hover:fill-red-500 transition" />
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            {/* Category */}
                            {product.category && (
                                <Link
                                    href={`/category/${product.category.slug}`}
                                    className="inline-block text-sm text-green-600 font-medium hover:underline mb-2"
                                    onClick={onClose}
                                >
                                    {product.category.icon} {product.category.name}
                                </Link>
                            )}

                            {/* Product Name */}
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h2>

                            {/* Brand */}
                            {product.brand && (
                                <p className="text-gray-600 mb-4">
                                    by <span className="font-semibold">{product.brand}</span>
                                </p>
                            )}

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(product.rating?.average || 0)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600">
                                    ({product.rating?.count || 0} reviews)
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-4xl font-bold text-gray-900">
                                        ₹{finalPrice}
                                    </span>
                                    {product.discountPrice && (
                                        <span className="text-xl text-gray-500 line-through">
                                            ₹{product.price}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600">
                                    per {product.unitValue} {product.unit}
                                </p>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Stock Status */}
                            {product.stock > 0 ? (
                                <p className="text-green-600 font-semibold mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                                    In Stock ({product.stock} available)
                                </p>
                            ) : (
                                <p className="text-red-600 font-semibold mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                    Out of Stock
                                </p>
                            )}

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-3">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-3 hover:bg-gray-100 transition"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className="px-8 font-bold text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="p-3 hover:bg-gray-100 transition"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <span className="text-gray-600 font-semibold">
                                        Total: ₹{(finalPrice * quantity).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-auto">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </button>
                            </div>

                            {/* View Full Details Link */}
                            <Link
                                href={`/products/${product._id}`}
                                className="text-center text-green-600 hover:text-green-700 font-semibold mt-4 block"
                                onClick={onClose}
                            >
                                View Full Details →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
        </>
    );
}
