'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import useCartStore from '@/store/useCartStore';

export default function ProductCard({ product, onQuickView }) {
    const addItem = useCartStore((state) => state.addItem);
    const getItemQuantity = useCartStore((state) => state.getItemQuantity);

    const discount = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const finalPrice = product.discountPrice || product.price;
    const inCart = getItemQuantity(product._id) > 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1);
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onQuickView) {
            onQuickView(product);
        }
    };

    return (
        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Product Image */}
            <div
                onClick={handleQuickView}
                className="block relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
            >
                <Image
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {discount}% OFF
                    </div>
                )}

                {/* Quick View Button */}
                <button
                    onClick={handleQuickView}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-blue-50"
                >
                    <Eye className="w-5 h-5 text-blue-600" />
                </button>

                {/* Quick Add to Cart */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-all hover:bg-green-700 flex items-center gap-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <ShoppingCart className="w-4 h-4" />
                    {inCart ? 'Add More' : 'Add to Cart'}
                </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Category */}
                {product.category && (
                    <Link
                        href={`/category/${product.category.slug}`}
                        className="text-xs text-green-600 font-medium hover:underline"
                    >
                        {product.category.icon} {product.category.name}
                    </Link>
                )}

                {/* Product Name */}
                <div onClick={handleQuickView} className="cursor-pointer">
                    <h3 className="font-semibold text-gray-800 mt-2 line-clamp-2 hover:text-green-600 transition">
                        {product.name}
                    </h3>
                </div>

                {/* Brand */}
                {product.brand && (
                    <p className="text-xs text-gray-500 mt-1">by {product.brand}</p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(product.rating?.average || 0)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-600">
                        ({product.rating?.count || 0})
                    </span>
                </div>

                {/* Price */}
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                        ₹{finalPrice}
                    </span>
                    {product.discountPrice && (
                        <span className="text-sm text-gray-500 line-through">
                            ₹{product.price}
                        </span>
                    )}
                </div>

                {/* Unit */}
                <p className="text-xs text-gray-500 mt-1">
                    per {product.unitValue} {product.unit}
                </p>

                {/* Stock Status */}
                {product.stock > 0 ? (
                    <p className="text-xs text-green-600 mt-2">
                        ✓ In Stock ({product.stock} available)
                    </p>
                ) : (
                    <p className="text-xs text-red-600 mt-2">
                        ✗ Out of Stock
                    </p>
                )}

                {/* In Cart Indicator */}
                {inCart && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-semibold">
                            {getItemQuantity(product._id)} in cart
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
