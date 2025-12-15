'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartItem from '@/components/cart/CartItem';
import useCartStore from '@/store/useCartStore';
import { ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';

export default function CartPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { items, updateQuantity, removeItem, clearCart, getTotal, getCount } = useCartStore();
    const [isClearing, setIsClearing] = useState(false);

    const subtotal = getTotal();
    const deliveryFee = subtotal > 0 ? 40 : 0;
    const total = subtotal + deliveryFee;

    const handleClearCart = () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            setIsClearing(true);
            clearCart();
            setTimeout(() => setIsClearing(false), 500);
        }
    };

    const handleCheckout = () => {
        // Check if user is authenticated
        if (status === 'unauthenticated') {
            // Redirect to login with callback to checkout
            router.push('/login?redirect=/checkout');
        } else {
            // User is authenticated, proceed to checkout
            router.push('/checkout');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
                    <p className="text-gray-600">
                        {getCount()} {getCount() === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {items.length === 0 ? (
                    /* Empty Cart State */
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">
                            Looks like you haven't added any items to your cart yet
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Cart Items</h2>
                                <button
                                    onClick={handleClearCart}
                                    disabled={isClearing}
                                    className="text-sm text-red-600 hover:text-red-700 font-semibold transition"
                                >
                                    Clear Cart
                                </button>
                            </div>

                            {items.map((item) => (
                                <CartItem
                                    key={item.product._id}
                                    item={{
                                        id: item.product._id,
                                        name: item.product.name,
                                        image: item.product.images?.[0],
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

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal ({getCount()} items)</span>
                                        <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Delivery Fee</span>
                                        <span className="font-semibold">
                                            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between text-lg font-bold text-gray-900">
                                            <span>Total</span>
                                            <span className="text-green-600">₹{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <Link
                                    href="/products"
                                    className="block text-center mt-4 text-green-600 hover:text-green-700 font-semibold transition"
                                >
                                    Continue Shopping
                                </Link>

                                {/* Delivery Info */}
                                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        <span className="font-semibold">Free delivery</span> on orders above ₹500
                                    </p>
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
