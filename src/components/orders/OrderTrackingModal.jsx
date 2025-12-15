'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
    X, Package, MapPin, Phone, Clock, CheckCircle,
    Truck, User, Navigation, Loader, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// Dynamically import map components to avoid SSR issues
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

// Fix for Leaflet icons in Next.js
if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

export default function OrderTrackingModal({ orderId, isOpen, onClose }) {
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails();
            initializeSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isOpen, orderId]);

    const initializeSocket = () => {
        const socket = io({
            path: '/api/socket',
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ OrderTrackingModal connected to socket');
            // Join room for this specific order
            socket.emit('order:join', orderId);
        });

        // Listen for delivery location updates
        socket.on('delivery:locationUpdate', (data) => {
            if (data.orderId === orderId) {
                console.log('📍 Delivery location updated:', data);
                setTracking(prev => ({
                    ...prev,
                    currentLocation: data.location,
                    distanceRemaining: data.distanceRemaining,
                    estimatedArrival: data.estimatedArrival,
                }));
            }
        });

        // Listen for order status updates
        socket.on('order:statusUpdated', (data) => {
            if (data.orderId === orderId) {
                console.log('📦 Order status updated:', data);
                fetchOrderDetails(); // Refresh order details
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ OrderTrackingModal disconnected from socket');
        });
    };

    const fetchOrderDetails = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            if (!res.ok) {
                throw new Error('Order not found');
            }

            const data = await res.json();
            setOrder(data.order);

            // Fetch tracking info if order has delivery partner
            if (data.order.assignedDeliveryPartner &&
                (data.order.status === 'OUT_FOR_DELIVERY' || data.order.status === 'PREPARING')) {
                fetchTrackingInfo();
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
            setLoading(false);
            onClose();
        }
    };

    const fetchTrackingInfo = async () => {
        try {
            const res = await fetch(`/api/delivery/location?orderId=${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setTracking(data.tracking);
            }
        } catch (error) {
            console.error('Error fetching tracking info:', error);
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            PLACED: {
                text: 'Order Placed',
                color: 'bg-blue-500',
                icon: Package,
                progress: 20,
                description: 'Your order has been received'
            },
            CONFIRMED: {
                text: 'Confirmed',
                color: 'bg-purple-500',
                icon: CheckCircle,
                progress: 40,
                description: 'Store confirmed your order'
            },
            PREPARING: {
                text: 'Being Prepared',
                color: 'bg-yellow-500',
                icon: Clock,
                progress: 60,
                description: 'Your order is being packed'
            },
            OUT_FOR_DELIVERY: {
                text: 'Out for Delivery',
                color: 'bg-orange-500',
                icon: Truck,
                progress: 80,
                description: 'On the way to you!'
            },
            DELIVERED: {
                text: 'Delivered',
                color: 'bg-green-500',
                icon: CheckCircle,
                progress: 100,
                description: 'Order delivered successfully'
            },
        };
        return statusMap[status] || {
            text: status,
            color: 'bg-gray-500',
            icon: Package,
            progress: 0,
            description: ''
        };
    };

    const handleClose = () => {
        onClose();
        // Remove orderId from URL
        router.push('/products', { scroll: false });
    };

    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 text-center">
                    <Loader className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    const showMap = order.assignedDeliveryPartner &&
        (order.status === 'OUT_FOR_DELIVERY' || order.status === 'PREPARING');

    // Store location (default to Mumbai for now)
    const storeLocation = [19.076, 72.8777];

    // Customer location from delivery address
    const customerLocation = order.deliveryAddress?.latitude && order.deliveryAddress?.longitude
        ? [order.deliveryAddress.latitude, order.deliveryAddress.longitude]
        : [19.0760, 72.8777]; // Default if not available

    // Delivery partner location
    const deliveryLocation = tracking?.currentLocation
        ? [tracking.currentLocation.latitude, tracking.currentLocation.longitude]
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Modal */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${statusInfo.color}`}>
                            <StatusIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
                            <p className="text-sm opacity-90">{statusInfo.description}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                        {/* Left Column - Order Details */}
                        <div className="space-y-6">
                            {/* Status Progress */}
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-gray-900">{statusInfo.text}</span>
                                    <span className="text-sm font-semibold text-gray-600">{statusInfo.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full ${statusInfo.color} transition-all duration-500`}
                                        style={{ width: `${statusInfo.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Delivery Partner Info */}
                            {order.assignedDeliveryPartner && (
                                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-green-600" />
                                        Delivery Partner
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                            {order.assignedDeliveryPartner.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-lg">
                                                {order.assignedDeliveryPartner.name}
                                            </p>
                                            {order.assignedDeliveryPartner.phone && (
                                                <p className="text-sm text-gray-600">
                                                    {order.assignedDeliveryPartner.phone}
                                                </p>
                                            )}
                                        </div>
                                        {order.assignedDeliveryPartner.phone && order.status === 'OUT_FOR_DELIVERY' && (
                                            <a
                                                href={`tel:${order.assignedDeliveryPartner.phone}`}
                                                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                            >
                                                <Phone className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                    {tracking?.estimatedArrival && (
                                        <div className="mt-4 pt-4 border-t border-green-200">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-green-600" />
                                                <span className="text-gray-700">
                                                    Estimated arrival: <strong>{new Date(tracking.estimatedArrival).toLocaleTimeString()}</strong>
                                                </span>
                                            </div>
                                            {tracking?.distanceRemaining && (
                                                <div className="flex items-center gap-2 text-sm mt-2">
                                                    <Navigation className="w-4 h-4 text-green-600" />
                                                    <span className="text-gray-700">
                                                        Distance: <strong>{tracking.distanceRemaining.toFixed(1)} km</strong>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Delivery Address */}
                            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Delivery Address
                                </h3>
                                <p className="font-semibold text-gray-900">{order.deliveryAddress.fullName}</p>
                                <p className="text-gray-700 mt-1">{order.deliveryAddress.phone}</p>
                                <p className="text-gray-700 mt-2">
                                    {order.deliveryAddress.addressLine1}
                                    {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                                </p>
                                <p className="text-gray-700">
                                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                                </p>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-gray-600" />
                                    Order Items ({order.items.length})
                                </h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                            {item.image && (
                                                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-green-600">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Delivery Fee</span>
                                        <span className="font-semibold">₹{order.deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                        <span>Total</span>
                                        <span className="text-green-600">₹{order.finalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 pt-2">
                                        <span>Payment Method</span>
                                        <span className="font-semibold">{order.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Map */}
                        <div className="space-y-6">
                            {showMap ? (
                                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden h-full min-h-[600px]">
                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <Truck className="w-5 h-5" />
                                            Live Tracking
                                        </h3>
                                        <p className="text-sm opacity-90">Watch your order arrive in real-time</p>
                                    </div>
                                    <div className="h-[calc(100%-80px)]">
                                        {typeof window !== 'undefined' && (
                                            <MapContainer
                                                center={deliveryLocation || customerLocation}
                                                zoom={13}
                                                style={{ height: '100%', width: '100%' }}
                                                ref={mapRef}
                                            >
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />

                                                {/* Store Marker */}
                                                <Marker position={storeLocation}>
                                                    <Popup>
                                                        <div className="text-center">
                                                            <p className="font-bold">🏪 Store</p>
                                                            <p className="text-xs">Your order starts here</p>
                                                        </div>
                                                    </Popup>
                                                </Marker>

                                                {/* Customer Marker */}
                                                <Marker position={customerLocation}>
                                                    <Popup>
                                                        <div className="text-center">
                                                            <p className="font-bold">🏠 Your Location</p>
                                                            <p className="text-xs">{order.deliveryAddress.addressLine1}</p>
                                                        </div>
                                                    </Popup>
                                                </Marker>

                                                {/* Delivery Partner Marker */}
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

                                                {/* Route line */}
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
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8 border-2 border-blue-200 text-center h-full flex flex-col items-center justify-center min-h-[600px]">
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                        <Package className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {order.status === 'DELIVERED' ? 'Order Delivered!' : 'Preparing Your Order'}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {order.status === 'DELIVERED'
                                            ? 'Thank you for your order!'
                                            : 'Live tracking will be available once your order is out for delivery'}
                                    </p>
                                    <div className="text-sm text-gray-500">
                                        <p>Estimated delivery: <strong>30-45 minutes</strong></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/my-orders')}
                        className="px-6 py-3 text-green-600 font-semibold hover:bg-green-50 rounded-lg transition flex items-center gap-2"
                    >
                        View All Orders
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 bg-green-600 text-white font-semibold hover:bg-green-700 rounded-lg transition"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
