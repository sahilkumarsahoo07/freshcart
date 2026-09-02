'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, ArrowRight, ChevronRight, ShoppingBag } from 'lucide-react';
import useWishlistStore from '@/store/useWishlistStore';
import useCartStore from '@/store/useCartStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCartBar from '@/components/cart/FloatingCartBar';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const [mounted, setMounted] = useState(false);
    const wishlistItems = useWishlistStore((state) => state.items);
    const removeItem = useWishlistStore((state) => state.removeItem);
    const clearWishlist = useWishlistStore((state) => state.clearWishlist);
    const addToCart = useCartStore((state) => state.addItem);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        toast.success(`Added ${product.name} to cart!`);
    };

    const handleMoveAllToCart = () => {
        wishlistItems.forEach(item => {
            addToCart(item, 1);
        });
        toast.success(`Moved all items to cart!`);
    };

    const handleRemove = (productId, name) => {
        removeItem(productId);
        toast.success(`Removed ${name} from wishlist`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Link href="/" className="hover:text-emerald-600">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-900 font-semibold">Wishlist</span>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                                <Heart className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Wishlist</h1>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    You have {wishlistItems.length} saved item{wishlistItems.length === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>

                        {wishlistItems.length > 0 && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleMoveAllToCart}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow flex items-center gap-2"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Move All to Cart
                                </button>
                                <button
                                    onClick={() => {
                                        clearWishlist();
                                        toast.success('Wishlist cleared');
                                    }}
                                    className="border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Wishlist Items Grid */}
                    {wishlistItems.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                            {wishlistItems.map((product) => {
                                const finalPrice = product.discountPrice || product.price;
                                const discount = product.discountPrice
                                    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                                    : 0;

                                return (
                                    <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-lg transition group">
                                        <div className="relative aspect-square bg-gray-50">
                                            <Image
                                                src={product.images?.[0] || '/placeholder-product.jpg'}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition duration-300"
                                            />

                                            {discount > 0 && (
                                                <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                                                    {discount}% OFF
                                                </span>
                                            )}

                                            <button
                                                onClick={() => handleRemove(product._id, product.name)}
                                                className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full flex items-center justify-center shadow transition"
                                                title="Remove from wishlist"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">
                                                    {product.category?.name || 'Fresh Grocery'}
                                                </span>
                                                <h3 className="font-bold text-gray-800 text-sm mt-1 line-clamp-2 hover:text-emerald-600 transition">
                                                    {product.name}
                                                </h3>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                                <div>
                                                    <span className="text-lg font-black text-gray-900">₹{finalPrice}</span>
                                                    {product.discountPrice && (
                                                        <span className="text-xs text-gray-400 line-through ml-1">₹{product.price}</span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition shadow flex items-center gap-1.5 text-xs font-bold"
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    <span>Add</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto my-12 space-y-4">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-400">
                                <Heart className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Your wishlist is empty</h2>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Save your favorite items here to purchase them anytime with 1 click.
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-md"
                            >
                                <span>Explore Fresh Products</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <FloatingCartBar />
        </div>
    );
}
