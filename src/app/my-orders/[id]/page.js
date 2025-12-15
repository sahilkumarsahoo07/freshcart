'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, User, Phone, Star, Navigation } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// Dynamically import map components
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);
const Polyline = dynamic(
    () => import('react-leaflet').then((mod) => mod.Polyline),
    { ssr: false }
);

// Fix for Leaflet icons
if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

export default function OrderDetailPage({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [order, setOrder] = useState(null);
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    // Rating states
    const [productRating, setProductRating] = useState(0);
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchOrder();
        }
    }, [status]);

    useEffect(() => {
        if (order && (order.status === 'OUT_FOR_DELIVERY' || order.status === 'PREPARING')) {
            initializeSocket();
            fetchTrackingInfo();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [order]);

    const initializeSocket = () => {
        const socket = io({
            path: '/api/socket',
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ Order details connected to socket');
            socket.emit('order:join', order._id);
        });

        socket.on('delivery:locationUpdate', (data) => {
            if (data.orderId === order._id) {
                console.log('📍 Delivery location updated:', data);
                setTracking(prev => ({
                    ...prev,
                    currentLocation: data.location,
                    distanceRemaining: data.distanceRemaining,
                    estimatedArrival: data.estimatedArrival,
                }));
            }
        });

        socket.on('order:statusUpdated', (data) => {
            if (data.orderId === order._id) {
                console.log('📦 Order status updated:', data);
                fetchOrder();
            }
        });
    };

    const fetchOrder = async () => {
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
            router.push('/my-orders');
        }
    };

    const fetchTrackingInfo = async () => {
        try {
            const { id } = await params;
            const res = await fetch(`/api/delivery/location?orderId=${id}`);
            if (res.ok) {
                const data = await res.json();
                setTracking(data.tracking);
            }
        } catch (error) {
            console.error('Error fetching tracking info:', error);
        }
    };

    const handleRatingSubmit = async () => {
        if (productRating === 0 || deliveryRating === 0) {
            toast.error('Please rate both product and delivery partner');
            return;
        }

        setSubmittingRating(true);
        try {
            const { id } = await params;
            const res = await fetch(`/api/orders/${id}/rating`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productRating,
                    deliveryRating,
                    comment: ratingComment,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to submit rating');
            }

            toast.success('Thank you for your feedback!');
            fetchOrder(); // Refresh to show rating submitted
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error('Failed to submit rating');
        } finally {
            setSubmittingRating(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PLACED: 'bg-blue-100 text-blue-700 border-blue-200',
            CONFIRMED: 'bg-purple-100 text-purple-700 border-purple-200',
            PREPARING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700 border-orange-200',
            DELIVERED: 'bg-green-100 text-green-700 border-green-200',
            CANCELLED: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const showMap = order.assignedDeliveryPartner &&
        (order.status === 'OUT_FOR_DELIVERY' || order.status === 'PREPARING');

    const storeLocation = [19.076, 72.8777];
    const customerLocation = order.deliveryAddress?.latitude && order.deliveryAddress?.longitude
        ? [order.deliveryAddress.latitude, order.deliveryAddress.longitude]
        : [19.0760, 72.8777];
    const deliveryLocation = tracking?.currentLocation
        ? [tracking.currentLocation.latitude, tracking.currentLocation.longitude]
        : null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/my-orders"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to My Orders
                </Link>

                {/* Order Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order {order.orderNumber}</h1>
                            <p className="text-gray-600">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {/* Order Timeline */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
                        <div className="space-y-4">
                            {['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((statusItem, index) => {
                                const currentIndex = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.status);
                                const isCompleted = index <= currentIndex;
                                const isCurrent = statusItem === order.status;

                                return (
                                    <div key={statusItem} className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-semibold ${isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {statusItem.replace(/_/g, ' ')}
                                            </p>
                                            {isCurrent && <p className="text-sm text-gray-600">Current status</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Live Tracking Map - Only show when order is being delivered */}
                {showMap && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Live Tracking</h2>
                                <p className="text-sm text-gray-600">Watch your order arrive in real-time</p>
                            </div>
                        </div>

                        <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-200">
                            {typeof window !== 'undefined' && (
                                <MapContainer
                                    center={deliveryLocation || customerLocation}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <Marker position={storeLocation}>
                                        <Popup>
                                            <div className="text-center">
                                                <p className="font-bold">🏪 Store</p>
                                                <p className="text-xs">Your order starts here</p>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    <Marker position={customerLocation}>
                                        <Popup>
                                            <div className="text-center">
                                                <p className="font-bold">🏠 Your Location</p>
                                                <p className="text-xs">{order.deliveryAddress.addressLine1}</p>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    {deliveryLocation && (
                                        <Marker position={deliveryLocation}>
                                            <Popup>
                                                <div className="text-center">
                                                    <p className="font-bold">🚚 {order.assignedDeliveryPartner.name}</p>
                                                    <p className="text-xs">On the way!</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {deliveryLocation && (
                                        <>
                                            <Polyline
                                                positions={[storeLocation, deliveryLocation]}
                                                color="gray"
                                                weight={3}
                                                opacity={0.5}
                                                dashArray="10, 10"
                                            />
                                            <Polyline
                                                positions={[deliveryLocation, customerLocation]}
                                                color="orange"
                                                weight={4}
                                                opacity={0.7}
                                            />
                                        </>
                                    )}
                                </MapContainer>
                            )}
                        </div>

                        {tracking && (
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                {tracking.distanceRemaining && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                        <Navigation className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-xs text-gray-600">Distance</p>
                                            <p className="font-bold text-gray-900">{tracking.distanceRemaining.toFixed(1)} km</p>
                                        </div>
                                    </div>
                                )}
                                {tracking.estimatedArrival && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                        <Clock className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-xs text-gray-600">ETA</p>
                                            <p className="font-bold text-gray-900">{new Date(tracking.estimatedArrival).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-6 h-6" />
                                Order Items ({order.items.length})
                            </h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            <Image
                                                src={item.image || '/placeholder-product.jpg'}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                                            <p className="text-sm text-gray-600 mb-2">Quantity: {item.quantity}</p>
                                            <p className="text-lg font-bold text-green-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rating Section - Only show after delivery */}
                        {order.status === 'DELIVERED' && !order.rating && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Star className="w-6 h-6 text-yellow-500" />
                                    Rate Your Experience
                                </h2>

                                <div className="space-y-6">
                                    {/* Product Rating */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            How was the product quality?
                                        </label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setProductRating(star)}
                                                    className="transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`w-10 h-10 ${star <= productRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Partner Rating */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            How was the delivery service?
                                        </label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setDeliveryRating(star)}
                                                    className="transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`w-10 h-10 ${star <= deliveryRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Additional Comments (Optional)
                                        </label>
                                        <textarea
                                            value={ratingComment}
                                            onChange={(e) => setRatingComment(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Tell us about your experience..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleRatingSubmit}
                                        disabled={submittingRating || productRating === 0 || deliveryRating === 0}
                                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {submittingRating ? 'Submitting...' : 'Submit Rating'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Show rating if already submitted */}
                        {order.status === 'DELIVERED' && order.rating && (
                            <div className="bg-green-50 rounded-xl border-2 border-green-200 p-6">
                                <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Thank you for your feedback!
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Product Quality:</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= order.rating.productRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Delivery Service:</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= order.rating.deliveryRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {order.rating.comment && (
                                        <p className="text-sm text-gray-700 mt-2 italic">"{order.rating.comment}"</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary & Details */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-6 h-6" />
                                Delivery Address
                            </h2>
                            <div className="space-y-2">
                                <p className="font-semibold text-gray-900">{order.deliveryAddress.fullName}</p>
                                <p className="text-gray-700">{order.deliveryAddress.phone}</p>
                                <p className="text-gray-700">
                                    {order.deliveryAddress.addressLine1}
                                    {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                                </p>
                                <p className="text-gray-700">
                                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                                </p>
                                {order.deliveryAddress.instructions && (
                                    <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                                        <span className="font-semibold">Note:</span> {order.deliveryAddress.instructions}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Delivery Partner Info */}
                        {order.assignedDeliveryPartner && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Truck className="w-6 h-6 text-green-600" />
                                    Delivery Partner
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {order.assignedDeliveryPartner.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{order.assignedDeliveryPartner.name}</p>
                                            <p className="text-sm text-gray-600">Your delivery partner</p>
                                        </div>
                                    </div>
                                    {order.assignedDeliveryPartner.phone && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone className="w-5 h-5 text-green-600" />
                                            <a href={`tel:${order.assignedDeliveryPartner.phone}`} className="font-semibold hover:text-green-600">
                                                {order.assignedDeliveryPartner.phone}
                                            </a>
                                        </div>
                                    )}
                                    {order.status === 'OUT_FOR_DELIVERY' && (
                                        <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                                            <p className="text-sm font-semibold text-orange-900">🚚 Your order is on the way!</p>
                                            <p className="text-xs text-orange-700 mt-1">You can call your delivery partner if needed</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payment & Summary */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-6 h-6" />
                                Payment Summary
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Delivery Fee</span>
                                    <span className="font-semibold">₹{order.deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
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
                                    <div className="flex justify-between text-gray-700 mt-2">
                                        <span>Payment Status</span>
                                        <span className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {order.status === 'DELIVERED' && (
                            <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                                Reorder
                            </button>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
