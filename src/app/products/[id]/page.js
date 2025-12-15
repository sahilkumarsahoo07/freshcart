'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Star, Minus, Plus, ChevronLeft, Truck, Shield } from 'lucide-react';

export default function ProductDetailPage() {
    const params = useParams();
    const { id } = params;

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();
            setProduct(data.product);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
                    <Link href="/products" className="text-green-600 hover:underline">
                        Browse all products
                    </Link>
                </div>
            </div>
        );
    }

    const discount = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;
    const finalPrice = product.discountPrice || product.price;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1">
                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/" className="text-gray-600 hover:text-green-600">
                                Home
                            </Link>
                            <span className="text-gray-400">/</span>
                            <Link href="/products" className="text-gray-600 hover:text-green-600">
                                Products
                            </Link>
                            {product.category && (
                                <>
                                    <span className="text-gray-400">/</span>
                                    <Link
                                        href={`/category/${product.category.slug}`}
                                        className="text-gray-600 hover:text-green-600"
                                    >
                                        {product.category.name}
                                    </Link>
                                </>
                            )}
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-900 font-semibold">{product.name}</span>
                        </div>
                    </div>
                </div>

                {/* Product Detail */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back to Products
                        </Link>

                        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-lg p-8">
                            {/* Product Image */}
                            <div>
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                    <Image
                                        src={product.images[0] || '/placeholder-product.jpg'}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {discount > 0 && (
                                        <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                            {discount}% OFF
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div>
                                {/* Category */}
                                {product.category && (
                                    <Link
                                        href={`/category/${product.category.slug}`}
                                        className="inline-block text-sm text-green-600 font-medium hover:underline mb-2"
                                    >
                                        {product.category.icon} {product.category.name}
                                    </Link>
                                )}

                                {/* Product Name */}
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    {product.name}
                                </h1>

                                {/* Brand */}
                                {product.brand && (
                                    <p className="text-gray-600 mb-4">by <span className="font-semibold">{product.brand}</span></p>
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
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600">{product.description}</p>
                                </div>

                                {/* Stock Status */}
                                {product.stock > 0 ? (
                                    <p className="text-green-600 font-semibold mb-6">
                                        ✓ In Stock ({product.stock} available)
                                    </p>
                                ) : (
                                    <p className="text-red-600 font-semibold mb-6">
                                        ✗ Out of Stock
                                    </p>
                                )}

                                {/* Quantity Selector */}
                                <div className="mb-6">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Quantity
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="p-3 hover:bg-gray-100 transition"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <span className="px-6 font-semibold">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                                className="p-3 hover:bg-gray-100 transition"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <span className="text-gray-600">
                                            Total: ₹{(finalPrice * quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mb-8">
                                    <button
                                        disabled={product.stock === 0}
                                        className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        Add to Cart
                                    </button>
                                    <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition">
                                        <Heart className="w-6 h-6 text-gray-600 hover:text-red-500" />
                                    </button>
                                </div>

                                {/* Features */}
                                <div className="border-t pt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <Truck className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Fast Delivery</p>
                                                <p className="text-xs text-gray-600">Within 30 mins</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Shield className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Quality Assured</p>
                                                <p className="text-xs text-gray-600">100% Fresh</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
