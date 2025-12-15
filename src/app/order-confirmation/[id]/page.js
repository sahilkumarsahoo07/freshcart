'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle, Package, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function OrderConfirmationPage({ params }) {
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            const { id } = await params;
            const res = await fetch(`/api/orders/${id}`);

            if (!res.ok) {
                throw new Error('Order not found');
            }

            const data = await res.json();
            setOrder(data.order);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order:', error);
            setLoading(false);
            router.push('/');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">
                {/* Success Message */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                        <p className="text-gray-600 mb-6">
                            Thank you for your order. We'll send you a confirmation email shortly.
                        </p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 rounded-lg">
                            <Package className="w-5 h-5 text-green-600" />
                            <div className="text-left">
                                <p className="text-sm text-gray-600">Order Number</p>
                                <p className="font-bold text-green-600">{order.orderNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Details</h2>

                        <div className="space-y-4">
                            {/* Status */}
                            <div className="flex items-start gap-3">
                                <Package className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="font-semibold text-gray-900">
                                        <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                                            {order.status}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Delivery Address</p>
                                    <p className="font-semibold text-gray-900">{order.deliveryAddress.fullName}</p>
                                    <p className="text-gray-700">{order.deliveryAddress.phone}</p>
                                    <p className="text-gray-700">
                                        {order.deliveryAddress.addressLine1}
                                        {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                                    </p>
                                    <p className="text-gray-700">
                                        {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                                    </p>
                                </div>
                            </div>

                            {/* Estimated Delivery */}
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                                    <p className="font-semibold text-gray-900">30-45 minutes</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                        <div className="space-y-3">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-gray-700">
                                    <span>
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}

                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between text-gray-700 mb-2">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700 mb-2">
                                    <span>Delivery Fee</span>
                                    <span className="font-semibold">₹{order.deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span className="text-green-600">₹{order.finalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>Payment Method</span>
                                    <span className="font-semibold">{order.paymentMethod}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/products"
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-center flex items-center justify-center gap-2"
                        >
                            Continue Shopping
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/my-orders"
                            className="flex-1 px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition text-center"
                        >
                            View My Orders
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
