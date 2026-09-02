'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Sparkles, Copy, Check, Clock, ShoppingBag, ArrowRight, Percent, Zap } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductQuickView from '@/components/products/ProductQuickView';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCartBar from '@/components/cart/FloatingCartBar';
import toast from 'react-hot-toast';
import useCartStore from '@/store/useCartStore';

export default function DealsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appliedCode, setAppliedCode] = useState('');
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const { applyCoupon, appliedCoupon } = useCartStore();

    const fallbackDeals = [
        { _id: 'd1', name: 'Fresh Farm Tomatoes (Hydrated)', price: 40, discountPrice: 29, unit: '500g', images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80'], rating: { average: 4.8 }, stock: 30 },
        { _id: 'd2', name: 'Premium Red Shimla Apples', price: 180, discountPrice: 139, unit: '1 kg', images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80'], rating: { average: 4.9 }, stock: 25 },
        { _id: 'd3', name: 'Fresh Farm Whole Milk', price: 70, discountPrice: 58, unit: '1 L', images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80'], rating: { average: 4.8 }, stock: 50 },
        { _id: 'd4', name: 'Artisan Whole Wheat Bread', price: 55, discountPrice: 42, unit: '400g', images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80'], rating: { average: 4.6 }, stock: 20 },
        { _id: 'd5', name: 'Cold Pressed Orange Juice', price: 120, discountPrice: 89, unit: '500ml', images: ['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80'], rating: { average: 4.7 }, stock: 15 },
        { _id: 'd6', name: 'Roasted Salted Almonds', price: 350, discountPrice: 279, unit: '250g', images: ['https://images.unsplash.com/photo-1508061252966-17df56214578?w=400&q=80'], rating: { average: 4.9 }, stock: 40 }
    ];

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/products');
                const data = await res.json();
                if (data.products && data.products.length > 0) {
                    const dealProds = data.products.filter(p => p.discountPrice && p.discountPrice < p.price);
                    setProducts(dealProds.length > 0 ? dealProds : data.products.slice(0, 8));
                } else {
                    setProducts(fallbackDeals);
                }
            } catch (err) {
                console.error('Failed to load deals:', err);
                setProducts(fallbackDeals);
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, []);

    const coupons = [
        { code: 'FRESH50', discount: 'Flat ₹50 OFF', minOrder: '₹199', desc: 'Valid on fresh organic fruits and green vegetables.', bg: 'from-amber-500 to-orange-600' },
        { code: 'SAVE20', discount: '20% Instant OFF', minOrder: '₹299', desc: 'Valid on all items, max discount ₹100.', bg: 'from-emerald-600 to-teal-700' },
        { code: 'INSTA100', discount: 'Flat ₹100 OFF', minOrder: '₹499', desc: 'Applicable on orders above ₹499.', bg: 'from-blue-600 to-indigo-700' },
        { code: 'SUPER25', discount: '25% OFF Super Deal', minOrder: '₹599', desc: 'Save up to ₹150 on party and bulk orders.', bg: 'from-purple-600 to-pink-600' },
    ];

    const handleApplyCoupon = (code) => {
        const res = applyCoupon(code);
        if (res.success) {
            setAppliedCode(code);
            toast.success(res.message);
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4 max-w-6xl space-y-10">
                    {/* Deals Header Banner */}
                    <div className="bg-gradient-to-r from-orange-600 via-rose-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="max-w-2xl space-y-4 relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                                <Zap className="w-4 h-4 text-yellow-300 fill-current animate-bounce" />
                                <span>Exclusive Promo Center</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                                Save Big with Instamart-Style Coupons!
                            </h1>
                            <p className="text-orange-100 text-sm md:text-base">
                                Click "Apply Coupon" below to attach discounts directly to your cart and checkout instantly.
                            </p>
                        </div>
                    </div>

                    {/* Promo Coupons Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            <Tag className="w-6 h-6 text-rose-500" />
                            Active Coupon Codes
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {coupons.map((c) => {
                                const isCurrent = appliedCoupon?.code === c.code;
                                return (
                                    <div key={c.code} className={`bg-gradient-to-br ${c.bg} text-white p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-4 border border-white/10 relative overflow-hidden`}>
                                        <div>
                                            <div className="flex items-center justify-between text-xs font-extrabold opacity-80 mb-1">
                                                <span>Min Order: {c.minOrder}</span>
                                                <Percent className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-xl font-black">{c.discount}</h3>
                                            <p className="text-xs opacity-90 mt-1 leading-relaxed">{c.desc}</p>
                                        </div>

                                        <div className="bg-black/20 p-2.5 rounded-xl backdrop-blur-md flex items-center justify-between">
                                            <span className="font-mono font-black text-sm tracking-widest">{c.code}</span>
                                            <button
                                                onClick={() => handleApplyCoupon(c.code)}
                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm ${
                                                    isCurrent
                                                        ? 'bg-emerald-500 text-white font-extrabold'
                                                        : 'bg-white text-gray-900 hover:bg-gray-100'
                                                }`}
                                            >
                                                {isCurrent ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-white" />
                                                        <span>Applied</span>
                                                    </>
                                                ) : (
                                                    <span>Apply Coupon</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Discounted Products Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-amber-500" />
                                    Flash Sale Discounted Items
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">Up to 50% discount on everyday essentials</p>
                            </div>
                            <Link href="/products" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                                Browse All Products <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse space-y-4">
                                        <div className="w-full aspect-square bg-gray-200 rounded-xl"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                {products.map((prod) => (
                                    <ProductCard
                                        key={prod._id}
                                        product={prod}
                                        onQuickView={(p) => setQuickViewProduct(p)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-gray-800">No active flash deals</h3>
                                <p className="text-xs text-gray-500 mt-1">Check back soon for new discounts!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
            <FloatingCartBar />

            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                />
            )}
        </div>
    );
}
