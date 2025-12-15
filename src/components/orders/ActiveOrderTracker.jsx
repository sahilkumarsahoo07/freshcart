'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Package, Truck, Clock, MapPin, Phone, X, ChevronRight, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';

export default function ActiveOrderPopup() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [activeOrders, setActiveOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            // Initial fetch
            fetchActiveOrders();

            // Initialize Socket.io connection
            const socket = io({
                path: '/api/socket',
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('✅ ActiveOrderTracker connected to socket');
                // Register user for order updates
                socket.emit('user:register', session.user.id);
            });

            // Listen for order status updates
            socket.on('order:statusUpdated', (data) => {
                console.log('📦 Order status updated:', data);
                // Refresh active orders when any order status changes
                fetchActiveOrders();
            });

            // Listen for new orders (in case user places a new order)
            socket.on('order:created', (data) => {
                console.log('🆕 New order created:', data);
                if (data.userId === session.user.id) {
                    fetchActiveOrders();
                }
            });

            socket.on('disconnect', () => {
                console.log('❌ ActiveOrderTracker disconnected from socket');
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [status, session?.user?.id]);

    const fetchActiveOrders = async () => {
        try {
            const res = await fetch('/api/orders/active');
            if (res.ok) {
                const data = await res.json();
                setActiveOrders(data.orders || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching active orders:', error);
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            PLACED: { text: 'Order Placed', color: 'bg-blue-500', icon: Package, progress: 20 },
            CONFIRMED: { text: 'Confirmed', color: 'bg-purple-500', icon: Package, progress: 40 },
            PREPARING: { text: 'Being Prepared', color: 'bg-yellow-500', icon: Clock, progress: 60 },
            OUT_FOR_DELIVERY: { text: 'Out for Delivery', color: 'bg-orange-500', icon: Truck, progress: 80 },
        };
        return statusMap[status] || { text: status, color: 'bg-gray-500', icon: Package, progress: 0 };
    };

    if (status === 'unauthenticated' || !session || activeOrders.length === 0) {
        return null;
    }

    // Hide on cart, checkout, and order pages
    const hiddenPaths = ['/cart', '/checkout', '/my-orders', '/order-confirmation'];
    if (hiddenPaths.some(path => pathname?.startsWith(path))) {
        return null;
    }

    return (
        <>
            {/* Floating Badge Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 p-4 flex items-center gap-3 animate-bounce"
                >
                    <Package className="w-6 h-6" />
                    <span className="font-bold pr-2">{activeOrders.length} Active Order{activeOrders.length > 1 ? 's' : ''}</span>
                    {activeOrders.some(o => o.status === 'OUT_FOR_DELIVERY') && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                </button>
            )}

            {/* Popup Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    {/* Popup Content */}
                    <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Package className="w-7 h-7" />
                                    Active Orders
                                </h2>
                                <p className="text-sm opacity-90 mt-1">{activeOrders.length} order{activeOrders.length > 1 ? 's' : ''} in progress</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetchActiveOrders}
                                    className="p-2 hover:bg-white/20 rounded-lg transition"
                                    title="Refresh"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4 space-y-4">
                            {activeOrders.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <div
                                        key={order._id}
                                        onClick={() => {
                                            setIsOpen(false);
                                            router.push(`/my-orders/${order._id}`);
                                        }}
                                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        {/* Order Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">#{order.orderNumber}</p>
                                                <p className="text-sm text-gray-600">{order.items?.length} items • ₹{order.finalAmount}</p>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-gray-400" />
                                        </div>

                                        {/* Status Progress */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-full ${statusInfo.color}`}>
                                                        <StatusIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{statusInfo.text}</span>
                                                </div>
                                                <span className="text-sm text-gray-600">{statusInfo.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${statusInfo.color} transition-all duration-500`}
                                                    style={{ width: `${statusInfo.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Delivery Partner */}
                                        {order.assignedDeliveryPartner && (
                                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg mb-3">
                                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {order.assignedDeliveryPartner.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 text-sm">{order.assignedDeliveryPartner.name}</p>
                                                    <p className="text-xs text-gray-600">Delivery Partner</p>
                                                </div>
                                                {order.assignedDeliveryPartner.phone && order.status === 'OUT_FOR_DELIVERY' && (
                                                    <a
                                                        href={`tel:${order.assignedDeliveryPartner.phone}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Delivery Address */}
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                            <p className="line-clamp-1">
                                                {order.deliveryAddress?.addressLine1}, {order.deliveryAddress?.city}
                                            </p>
                                        </div>

                                        {/* Live Indicator */}
                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <div className="mt-3 flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-lg">
                                                <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                                                <p className="text-sm font-semibold">🚚 On the way to you!</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push('/my-orders');
                                }}
                                className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition"
                            >
                                View All Orders
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </>
    );
}
