'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartItem from '@/components/cart/CartItem';
import useCartStore from '@/store/useCartStore';
import { ShoppingBag, ArrowRight, ShoppingCart, Tag, Truck, CheckCircle2, ShieldCheck, Trash2, Zap, ArrowLeft, Percent, Sparkles, Clock, Flame, Plus, Star, Gift, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isMounted, setIsMounted] = useState(false);

    const {
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotal,
        getCount,
        appliedCoupon,
        AVAILABLE_COUPONS,
        applyCoupon,
        removeCoupon,
        getDiscount
    } = useCartStore();

    const [isClearing, setIsClearing] = useState(false);
    const [couponInput, setCouponInput] = useState('');
    const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const subtotal = getTotal();
    const discount = getDiscount();
    const freeDeliveryThreshold = 299;
    const deliveryFee = subtotal > 0 ? (subtotal >= freeDeliveryThreshold ? 0 : 40) : 0;
    const finalTotal = Math.max(0, subtotal - discount + deliveryFee);
    const amountNeededForFree = Math.max(0, freeDeliveryThreshold - subtotal);
    const progressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

    const quickAddItems = [
        { _id: 'q1', name: 'Fresh Organic Farm Tomatoes', price: 39, discountPrice: 29, weight: '500g', images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80'] },
        { _id: 'q2', name: 'Fresh Red Shimla Apples', price: 180, discountPrice: 139, weight: '1 kg', images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80'] },
        { _id: 'q3', name: 'Pure Country Cow Milk', price: 70, discountPrice: 58, weight: '1 L', images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80'] },
        { _id: 'q4', name: 'Artisan Whole Wheat Bread', price: 55, discountPrice: 42, weight: '400g', images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80'] }
    ];

    const handleClearCart = () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            setIsClearing(true);
            clearCart();
            setTimeout(() => setIsClearing(false), 500);
        }
    };

    const handleApplyCoupon = (codeToApply) => {
        const targetCode = codeToApply || couponInput;
        if (!targetCode) return;
        const res = applyCoupon(targetCode);
        if (res.success) {
            setCouponMsg({ type: 'success', text: res.message });
            setCouponInput('');
        } else {
            setCouponMsg({ type: 'error', text: res.message });
        }
    };

    const handleCheckout = () => {
        if (status === 'unauthenticated') {
            router.push('/login?redirect=/checkout');
        } else {
            router.push('/checkout');
        }
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            <Navbar />

            {/* Instamart Next-Gen Hero Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white py-6 md:py-10 border-b border-emerald-800/40 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="container mx-auto px-4 max-w-6xl relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-500/30">
                            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-pulse" />
                            <span>INSTAMART EXPRESS DARK STORE</span>
                            <span className="text-emerald-400 font-bold">• 10 MIN ETA</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Shopping Cart</h1>
                        <p className="text-emerald-200/80 text-xs md:text-sm font-medium">
                            {getCount()} {getCount() === 1 ? 'item' : 'items'} in your basket • Subtotal: <span className="text-yellow-300 font-black">₹{subtotal.toFixed(0)}</span>
                        </p>
                    </div>

                    {/* Step Breadcrumb Bar */}
                    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-xs font-black shadow-lg">
                        <span className="text-emerald-400 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                            My Cart
                        </span>
                        <span className="text-gray-600">→</span>
                        <span className="text-gray-400 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-gray-400 flex items-center justify-center text-xs font-black">2</span>
                            Checkout
                        </span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {items.length === 0 ? (
                    /* Empty Cart View */
                    <div className="space-y-10">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 text-center max-w-lg mx-auto">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner text-emerald-700">
                                <ShoppingCart className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Your Basket is Empty</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Discover fresh produce, dairy, bakery, snacks, and everyday groceries delivered in 10 minutes.
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl font-black text-sm hover:from-emerald-700 hover:to-teal-800 transition shadow-xl"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Browse Grocery Store
                            </Link>
                        </div>

                        {/* Quick Recommendations Grid */}
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    Popular Best-Sellers (1-Click Add)
                                </h3>
                                <Link href="/products" className="text-xs font-bold text-emerald-700 hover:underline">
                                    Browse All →
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {quickAddItems.map((prod) => (
                                    <div key={prod._id} className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
                                        <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden">
                                            <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-gray-900 truncate">{prod.name}</p>
                                            <p className="text-[11px] text-gray-400 font-semibold">{prod.weight}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="font-black text-emerald-700 text-xs">₹{prod.discountPrice}</span>
                                                <span className="line-through text-[10px] text-gray-400">₹{prod.price}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                addItem(prod);
                                                toast.success(`Added ${prod.name} to cart!`);
                                            }}
                                            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-black text-xs border border-emerald-200 transition flex items-center justify-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>ADD</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                        {/* Left Cart Content Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Free Shipping Express Bar Card */}
                            <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl border border-emerald-700/50">
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-2xl bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center text-yellow-300">
                                            <Truck className="w-5 h-5 animate-bounce" />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-sm text-white">
                                                {amountNeededForFree > 0 ? (
                                                    <>Add <span className="text-yellow-300 font-black">₹{amountNeededForFree}</span> for FREE Express Delivery</>
                                                ) : (
                                                    <span className="text-emerald-300 font-black">🎉 FREE Express 10-Min Delivery Unlocked!</span>
                                                )}
                                            </h4>
                                            <p className="text-xs text-emerald-200/80 font-medium">Guaranteed fast dispatch from nearest dark store</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-emerald-300 bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-700">
                                        {progressPercent.toFixed(0)}%
                                    </span>
                                </div>

                                <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="bg-gradient-to-r from-yellow-400 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Products Container */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-xl font-black text-gray-900">Cart Products</h2>
                                        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                                            {getCount()} Items
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleClearCart}
                                        disabled={isClearing}
                                        className="text-xs font-extrabold text-rose-600 hover:bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-100 transition"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <CartItem
                                            key={item.product._id}
                                            item={{
                                                id: item.product._id,
                                                name: item.product.name,
                                                image: item.product.images?.[0] || item.product.image,
                                                price: item.product.price,
                                                discountPrice: item.product.discountPrice,
                                                unit: item.product.unit,
                                                unitValue: item.product.unitValue,
                                                quantity: item.quantity,
                                            }}
                                            onUpdateQuantity={updateQuantity}
                                            onRemove={removeItem}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Selectable Promo Coupons Sheet */}
                            <div className="bg-white rounded-3xl shadow-sm border border-emerald-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                                            🏷️
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 text-base">Select Available Coupon</h3>
                                            <p className="text-xs text-gray-500 font-semibold">Click apply to get instant order discount</p>
                                        </div>
                                    </div>
                                    {appliedCoupon && (
                                        <button
                                            onClick={removeCoupon}
                                            className="text-xs font-black text-rose-600 hover:underline"
                                        >
                                            Remove Active Coupon
                                        </button>
                                    )}
                                </div>

                                {/* Custom Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        placeholder="Enter code (e.g. FRESH50)"
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <button
                                        onClick={() => handleApplyCoupon()}
                                        className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow transition"
                                    >
                                        Apply
                                    </button>
                                </div>

                                {couponMsg.text && (
                                    <p className={`text-xs font-bold ${couponMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {couponMsg.text}
                                    </p>
                                )}

                                {/* Available Coupons Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                    {AVAILABLE_COUPONS.map((coupon) => {
                                        const isApplied = appliedCoupon?.code === coupon.code;
                                        const isEligible = subtotal >= coupon.minOrder;
                                        return (
                                            <div
                                                key={coupon.code}
                                                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                                                    isApplied
                                                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                                                        : isEligible
                                                        ? 'bg-white border-gray-200 hover:border-emerald-400'
                                                        : 'bg-gray-50 border-gray-200 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono font-black text-xs text-emerald-900 bg-emerald-100 px-3 py-1 rounded-lg tracking-wider">
                                                        {coupon.code}
                                                    </span>

                                                    {isApplied ? (
                                                        <button
                                                            onClick={removeCoupon}
                                                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow transition"
                                                        >
                                                            REMOVE
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApplyCoupon(coupon.code)}
                                                            disabled={!isEligible}
                                                            className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                                                                isEligible
                                                                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow'
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                            }`}
                                                        >
                                                            {isEligible ? 'APPLY' : `Min ₹${coupon.minOrder}`}
                                                        </button>
                                                    )}
                                                </div>

                                                <p className="text-xs font-semibold text-gray-700">
                                                    {coupon.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Order Bill Summary Sidebar */}
                        <div className="lg:col-span-1 sticky top-20">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 space-y-6">
                                <h2 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-3">
                                    Bill Details
                                </h2>

                                <div className="space-y-3.5 text-sm font-semibold">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Items Subtotal ({getCount()})</span>
                                        <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                                    </div>

                                    {appliedCoupon && (
                                        <div className="flex justify-between text-emerald-700 font-black bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                                            <span className="flex items-center gap-1.5">
                                                <Tag className="w-4 h-4 text-emerald-600" />
                                                Discount ({appliedCoupon.code})
                                            </span>
                                            <span>- ₹{discount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Charge</span>
                                        <span>
                                            {deliveryFee === 0 ? (
                                                <span className="text-emerald-700 font-black bg-emerald-100 px-2.5 py-0.5 rounded-md text-xs">FREE</span>
                                            ) : (
                                                <span className="font-bold text-gray-900">₹{deliveryFee.toFixed(2)}</span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                                        <div>
                                            <p className="text-base font-black text-gray-900">Total Payable</p>
                                            <p className="text-[11px] text-gray-400">Inclusive of all taxes</p>
                                        </div>
                                        <p className="text-2xl font-black text-emerald-700">
                                            ₹{finalTotal.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:opacity-95 text-white rounded-2xl font-black text-sm transition shadow-xl flex items-center justify-center gap-2 group"
                                >
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 pt-2 border-t border-gray-100">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span>100% Guaranteed 10-Min Express Dispatch</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
