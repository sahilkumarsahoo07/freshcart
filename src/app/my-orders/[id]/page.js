'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
    ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle2,
    Navigation, User, Phone, Headphones, Star, ThumbsUp, Heart,
    Sparkles, MessageSquare, Send
} from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// Dynamically import CustomerTrackingMap component for SSR safety
const CustomerTrackingMap = dynamic(() => import('@/components/orders/CustomerTrackingMap'), {
    ssr: false,
    loading: () => (
        <div className="h-80 sm:h-96 bg-gradient-to-br from-emerald-50/80 to-slate-100 animate-pulse rounded-3xl flex flex-col items-center justify-center gap-2 text-xs font-black text-emerald-800 border border-emerald-200">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Initializing Live Delivery Route Map...</span>
        </div>
    ),
});

export default function OrderDetailsPage({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tracking, setTracking] = useState(null);

    // Rating State
    const [deliveryRating, setDeliveryRating] = useState(5);
    const [productRating, setProductRating] = useState(5);
    const [hoverDelivery, setHoverDelivery] = useState(0);
    const [hoverProduct, setHoverProduct] = useState(0);
    const [selectedTags, setSelectedTags] = useState(['⚡ Superfast Delivery', '😊 Polite Executive']);
    const [comment, setComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    const socketRef = useRef(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchOrder();
        }
    }, [status, router]);

    // Setup optional Socket.io & smart status polling loop
    useEffect(() => {
        if (!order?._id) return;

        // Stop polling completely if order is finished
        if (order.status === 'DELIVERED' || order.status === 'CANCELLED') return;

        // 1. Optional Socket setup (no noisy auto-retry loops)
        if (process.env.NEXT_PUBLIC_SOCKET_ENABLED === 'true') {
            try {
                socketRef.current = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
                    reconnectionAttempts: 2,
                    timeout: 5000,
                });

                socketRef.current.on('connect', () => {
                    socketRef.current.emit('join:order', order._id);
                });

                socketRef.current.on('order:locationUpdated', (data) => {
                    setTracking(data);
                });

                socketRef.current.on('order:statusUpdated', (data) => {
                    setOrder((prev) => (prev ? { ...prev, status: data.status } : prev));
                    toast.success(`Live Order Status: ${data.status.replace(/_/g, ' ')}`);
                });
            } catch (err) {
                console.warn('Socket notice:', err.message);
            }
        }

        // 2. Smart 8s HTTP polling loop for active orders only
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/orders/${order._id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.order) {
                        setOrder((prev) => {
                            if (prev && prev.status !== data.order.status) {
                                toast.success(`Order Status Updated: ${data.order.status.replace(/_/g, ' ')}`);
                            }
                            return data.order;
                        });
                    }
                    if (data.tracking) setTracking(data.tracking);
                }
            } catch (err) {
                console.warn('Status poll notice:', err.message);
            }
        }, 8000);

        return () => {
            clearInterval(pollInterval);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [order?._id, order?.status]);

    const fetchOrder = async () => {
        try {
            const { id } = await params;
            const res = await fetch(`/api/orders/${id}`);
            if (!res.ok) throw new Error('Order not found');
            const data = await res.json();
            setOrder(data.order);
            if (data.tracking) setTracking(data.tracking);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        setSubmittingRating(true);

        try {
            const { id } = await params;
            const fullComment = selectedTags.length > 0
                ? `${selectedTags.join(', ')}. ${comment}`.trim()
                : comment;

            const res = await fetch(`/api/orders/${id}/rating`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryRating,
                    productRating,
                    comment: fullComment,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to submit rating');
            }

            toast.success('Thank you! Rating submitted successfully ⭐');
            fetchOrder();
        } catch (error) {
            toast.error(error.message || 'Failed to submit rating');
        } finally {
            setSubmittingRating(false);
        }
    };

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((t) => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-slate-700 tracking-wider uppercase">Loading Order Details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const showMap = ['OUT_FOR_DELIVERY', 'PREPARING', 'REACHED_STORE', 'ARRIVED_AT_CUSTOMER'].includes(order.status);

    const ORDER_STEPS = [
        { key: 'PLACED', label: 'Placed' },
        { key: 'CONFIRMED', label: 'Confirmed' },
        { key: 'PREPARING', label: 'Preparing' },
        { key: 'REACHED_STORE', label: 'At Store' },
        { key: 'OUT_FOR_DELIVERY', label: 'On Ride' },
        { key: 'ARRIVED_AT_CUSTOMER', label: 'At Doorstep' },
        { key: 'DELIVERED', label: 'Delivered' },
    ];

    const getStatusIndex = (currentStatus) => {
        const orderOfStatus = ['PLACED', 'CONFIRMED', 'PREPARING', 'REACHED_STORE', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER', 'DELIVERED'];
        return orderOfStatus.indexOf(currentStatus);
    };

    const currentStepIndex = getStatusIndex(order.status);

    const getBannerDetails = () => {
        switch (order.status) {
            case 'DELIVERED':
                return {
                    bg: 'from-emerald-600 to-teal-700 text-white',
                    title: 'Order Delivered Successfully!',
                    subtitle: 'Your items have been delivered safely. Enjoy your fresh groceries!',
                    badge: '✓ Delivered',
                };
            case 'ARRIVED_AT_CUSTOMER':
                return {
                    bg: 'from-emerald-500 to-emerald-600 text-white animate-pulse',
                    title: 'Rider is at Your Doorstep! 🚪',
                    subtitle: 'Please receive your package from our delivery executive.',
                    badge: '⚡ At Doorstep',
                };
            case 'OUT_FOR_DELIVERY':
                return {
                    bg: 'from-orange-500 to-amber-600 text-white',
                    title: 'Out for Express Delivery 🏍️',
                    subtitle: 'Your rider is on the way with your order items.',
                    badge: '🚀 In Transit',
                };
            case 'REACHED_STORE':
                return {
                    bg: 'from-indigo-600 to-blue-600 text-white',
                    title: 'Rider Reached Dark Store 🏬',
                    subtitle: 'Packing items and getting ready to ride.',
                    badge: '📦 Packing',
                };
            default:
                return {
                    bg: 'from-slate-800 to-slate-900 text-white',
                    title: 'Preparing Your Order 🛒',
                    subtitle: 'Store staff is packing your items with care.',
                    badge: '⏳ Active Order',
                };
        }
    };

    const banner = getBannerDetails();

    const QUICK_TAGS = [
        '⚡ Superfast Delivery',
        '😊 Polite Executive',
        '📦 Safe Packaging',
        '🥬 Fresh Produce',
        '📞 Great Communication',
        '💯 Perfect Order',
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans antialiased">
            <Navbar />

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Back to Orders Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/my-orders"
                        className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-emerald-700 transition bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to My Orders</span>
                    </Link>

                    <span className="text-[11px] font-black tracking-wider uppercase bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
                        Order #{order.orderNumber}
                    </span>
                </div>

                {/* Hero Status Banner */}
                <div className={`rounded-3xl p-6 sm:p-7 bg-gradient-to-r ${banner.bg} shadow-lg relative overflow-hidden`}>
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1.5 max-w-xl">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-wide uppercase">
                                {banner.badge}
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{banner.title}</h1>
                            <p className="text-xs sm:text-sm font-medium text-white/90">{banner.subtitle}</p>
                        </div>

                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right space-y-1">
                            <span className="text-[11px] font-bold text-white/80 block">Payment Method</span>
                            <span className="text-sm font-black uppercase tracking-wider block">
                                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
                            </span>
                            <span className="text-xs font-bold text-emerald-200">Total Paid: ₹{order.finalAmount}</span>
                        </div>
                    </div>

                    {/* Stepper Progress Bar - Only for Active Orders */}
                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                        <div className="mt-6 pt-5 border-t border-white/20 relative z-10">
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {ORDER_STEPS.map((st, idx) => {
                                    const isDone = idx <= currentStepIndex;
                                    const isCurr = st.key === order.status;
                                    return (
                                        <div key={st.key} className="flex flex-col items-center gap-1.5">
                                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${isCurr
                                                    ? 'bg-white text-slate-900 font-black ring-4 ring-white/40 shadow-lg scale-110'
                                                    : isDone
                                                        ? 'bg-white/90 text-slate-900 font-bold'
                                                        : 'bg-white/20 text-white/60 font-medium'
                                                }`}>
                                                {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
                                            </div>
                                            <span className={`text-[10px] sm:text-[11px] truncate max-w-full font-bold ${isCurr ? 'text-white font-black underline decoration-2 underline-offset-4' : isDone ? 'text-white/90' : 'text-white/50'}`}>
                                                {st.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main 2-Column Responsive Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* Left Column: Live Map / Rating Card & Executive Info (7 Cols) */}
                    <div className="lg:col-span-7 space-y-5">

                        {/* Interactive Live Map (Active Delivery) */}
                        {showMap && (
                            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 space-y-3">
                                <CustomerTrackingMap
                                    orderId={order._id}
                                    customerLat={order.deliveryAddress?.latitude}
                                    customerLng={order.deliveryAddress?.longitude}
                                    trackingData={tracking}
                                    partnerName={order.assignedDeliveryPartner?.name}
                                    addressText={[order.deliveryAddress?.addressLine1, order.deliveryAddress?.city].filter(Boolean).join(', ')}
                                />
                            </div>
                        )}

                        {/* Market-Standard Post-Delivery Rating Card (Triggered when DELIVERED) */}
                        {order.status === 'DELIVERED' && (
                            <div className="bg-gradient-to-br from-white to-emerald-50/40 p-6 rounded-3xl border border-emerald-200/80 shadow-sm space-y-5">
                                <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900">How was your Delivery Experience?</h3>
                                            <p className="text-xs text-slate-500 font-medium">Rate your delivery executive & order quality</p>
                                        </div>
                                    </div>
                                </div>

                                {order.rating ? (
                                    /* Already Rated State */
                                    <div className="bg-white p-5 rounded-2xl border border-emerald-200 space-y-3 text-center">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                                            <Star className="w-6 h-6 fill-amber-400" />
                                        </div>
                                        <h4 className="text-sm font-black text-slate-900">Thank you for your feedback!</h4>
                                        <div className="flex justify-center gap-4 text-xs font-bold text-slate-700">
                                            <span>Rider Rating: <strong className="text-amber-600">{order.rating.deliveryRating} ★</strong></span>
                                            <span>Product Rating: <strong className="text-amber-600">{order.rating.productRating} ★</strong></span>
                                        </div>
                                        {order.rating.comment && (
                                            <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                "{order.rating.comment}"
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    /* Interactive Rating Form */
                                    <form onSubmit={handleRatingSubmit} className="space-y-4">
                                        {/* Rider Rating Stars */}
                                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
                                            <label className="text-xs font-black text-slate-900 block flex items-center justify-between">
                                                <span>Rate Delivery Executive ({order.assignedDeliveryPartner?.name || 'Rider'})</span>
                                                <span className="text-amber-600 font-extrabold text-sm">{hoverDelivery || deliveryRating} ★</span>
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setDeliveryRating(star)}
                                                        onMouseEnter={() => setHoverDelivery(star)}
                                                        onMouseLeave={() => setHoverDelivery(0)}
                                                        className="p-1 transition transform hover:scale-125 focus:outline-none"
                                                    >
                                                        <Star
                                                            className={`w-7 h-7 ${star <= (hoverDelivery || deliveryRating)
                                                                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                                                    : 'text-slate-300'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Product Rating Stars */}
                                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
                                            <label className="text-xs font-black text-slate-900 block flex items-center justify-between">
                                                <span>Rate Order & Product Freshness</span>
                                                <span className="text-amber-600 font-extrabold text-sm">{hoverProduct || productRating} ★</span>
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setProductRating(star)}
                                                        onMouseEnter={() => setHoverProduct(star)}
                                                        onMouseLeave={() => setHoverProduct(0)}
                                                        className="p-1 transition transform hover:scale-125 focus:outline-none"
                                                    >
                                                        <Star
                                                            className={`w-7 h-7 ${star <= (hoverProduct || productRating)
                                                                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                                                    : 'text-slate-300'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quick Compliment Chips */}
                                        <div className="space-y-2">
                                            <span className="text-xs font-bold text-slate-700 block">Add Quick Feedback:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {QUICK_TAGS.map((tag) => {
                                                    const isSel = selectedTags.includes(tag);
                                                    return (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => toggleTag(tag)}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isSel
                                                                    ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                                                    : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
                                                                }`}
                                                        >
                                                            {tag}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Feedback Comment Box */}
                                        <div className="space-y-1">
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Write additional feedback for rider or store (optional)..."
                                                rows={2}
                                                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={submittingRating}
                                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 tracking-wide disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                            <span>{submittingRating ? 'Submitting Feedback...' : 'SUBMIT RATING & FEEDBACK'}</span>
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Delivery Partner Info Card */}
                        {order.assignedDeliveryPartner && (
                            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center shadow-md">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-black text-slate-900">{order.assignedDeliveryPartner.name}</h4>
                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.9
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                            {order.status === 'DELIVERED' ? 'Delivery Completed' : 'Assigned Delivery Executive'}
                                        </p>
                                    </div>
                                </div>

                                {order.status === 'DELIVERED' ? (
                                    <a
                                        href="tel:18001234567"
                                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-sm"
                                    >
                                        <Headphones className="w-4 h-4 text-emerald-400" /> Contact Support
                                    </a>
                                ) : (
                                    order.assignedDeliveryPartner.phone && (
                                        <a
                                            href={`tel:${order.assignedDeliveryPartner.phone}`}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                        >
                                            <Phone className="w-4 h-4" /> Call Executive
                                        </a>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Items, Delivery Address & Payment Breakdown (5 Cols) */}
                    <div className="lg:col-span-5 space-y-5">

                        {/* Order Items Card */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3.5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-emerald-600" />
                                    <span>Ordered Items ({order.items.length})</span>
                                </h3>
                                <span className="text-[11px] font-bold text-slate-400">Total Items</span>
                            </div>

                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs font-medium bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0 shadow-xs">
                                                <Image
                                                    src={item.image || '/placeholder-product.jpg'}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                                    ₹{item.price} × <span className="text-emerald-700 font-extrabold">{item.quantity}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-mono font-black text-slate-900 text-sm">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address Card */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <MapPin className="w-4 h-4 text-rose-500" />
                                <span>Delivery Address</span>
                            </h3>
                            <div className="text-xs font-medium text-slate-700 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-black text-slate-900 text-sm">{order.deliveryAddress?.fullName}</p>
                                    <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-md">HOME</span>
                                </div>
                                <p className="text-slate-500 font-semibold">{order.deliveryAddress?.phone}</p>
                                <p className="text-slate-600 leading-relaxed font-medium pt-1">
                                    {[order.deliveryAddress?.addressLine1, order.deliveryAddress?.city, order.deliveryAddress?.zipCode].filter(Boolean).join(', ')}
                                </p>
                            </div>
                        </div>

                        {/* Payment Breakdown Card */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2.5 text-xs font-medium">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                <span>Bill Details</span>
                            </h3>

                            <div className="flex justify-between text-slate-600 font-medium">
                                <span>Items Subtotal</span>
                                <span className="font-mono font-bold text-slate-800">₹{order.totalAmount}</span>
                            </div>

                            <div className="flex justify-between text-slate-600 font-medium">
                                <span>Delivery Fee</span>
                                <span className="font-mono font-bold text-slate-800">
                                    {order.deliveryFee ? `₹${order.deliveryFee}` : 'FREE'}
                                </span>
                            </div>

                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                                    <span>Discount Saved</span>
                                    <span className="font-mono">-₹{order.discountAmount}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-slate-900 font-black text-base pt-3 border-t border-slate-100">
                                <div>
                                    <span className="block">Total Amount</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        Paid via {order.paymentMethod}
                                    </span>
                                </div>
                                <span className="text-emerald-700 font-mono text-lg">₹{order.finalAmount}</span>
                            </div>
                        </div>

                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
