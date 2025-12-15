'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Package, Clock, MapPin, DollarSign, X, Check } from 'lucide-react';
import { calculateOrderEarnings } from '@/lib/earningsCalculator';

export default function OrderNotifications() {
    const { data: session, status } = useSession();
    const [socket, setSocket] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [accepting, setAccepting] = useState(null);
    const [dismissedOrders, setDismissedOrders] = useState(() => {
        // Load dismissed orders from localStorage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dismissedOrders');
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    });

    useEffect(() => {
        console.log('OrderNotifications mounted', { status, role: session?.user?.role });

        if (status === 'authenticated' && session?.user?.role === 'DELIVERY') {
            console.log('Initializing Socket.io for delivery partner:', session.user.id);

            // Fetch existing unassigned orders
            const fetchExistingOrders = async () => {
                try {
                    const res = await fetch('/api/delivery/available-orders');
                    const data = await res.json();
                    if (data.success && data.orders.length > 0) {
                        console.log(`📋 Found ${data.orders.length} existing unassigned orders`);
                        // Filter out dismissed orders
                        const filteredOrders = data.orders.filter(
                            order => !dismissedOrders.includes(order.orderId)
                        );
                        setAvailableOrders(filteredOrders);
                        console.log(`📋 Showing ${filteredOrders.length} orders after filtering dismissed`);
                    }
                } catch (error) {
                    console.error('Error fetching existing orders:', error);
                }
            };

            fetchExistingOrders();

            // Connect to Socket.io
            const newSocket = io('http://localhost:3000', {
                path: '/api/socket',
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket.io Connected!', newSocket.id);
                // Register as delivery partner
                newSocket.emit('delivery:register', session.user.id);
                console.log('Registered as delivery partner:', session.user.id);

                // Request notification permission
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission().then(permission => {
                        console.log('Notification permission:', permission);
                    });
                }
            });

            // Listen for new orders
            newSocket.on('order:new', (order) => {
                console.log('🔔 NEW ORDER RECEIVED:', order);
                setAvailableOrders(prev => {
                    // Check if order already exists
                    const exists = prev.some(o => o.orderId === order.orderId);
                    if (exists) {
                        console.log('Order already in list, skipping');
                        return prev;
                    }
                    const updated = [...prev, order];
                    console.log('Available orders updated:', updated.length);
                    return updated;
                });

                // Show browser notification
                if (Notification.permission === 'granted') {
                    const notification = new Notification('New Order Available!', {
                        body: `Order #${order.orderNumber} - ₹${order.finalAmount}`,
                        icon: '/logo.png',
                        tag: order.orderId
                    });
                    console.log('Browser notification shown');
                } else {
                    console.log('Browser notification permission:', Notification.permission);
                }

                // Show toast
                toast.success(`New order available: #${order.orderNumber}`, {
                    duration: 5000
                });
                console.log('Toast notification shown');
            });

            // Listen for order assignments
            newSocket.on('order:assigned', ({ orderId }) => {
                console.log('📦 Order assigned:', orderId);
                setAvailableOrders(prev => prev.filter(o => o.orderId !== orderId));
                setAccepting(null);

                // Remove from dismissed list if it was there
                setDismissedOrders(prev => {
                    const updated = prev.filter(id => id !== orderId);
                    localStorage.setItem('dismissedOrders', JSON.stringify(updated));
                    return updated;
                });
            });

            // Listen for acceptance confirmation
            newSocket.on('order:accepted', ({ orderId, success, message }) => {
                console.log('✅ Order acceptance response:', { orderId, success, message });
                setAccepting(null);
                if (success) {
                    toast.success('Order accepted successfully!');
                    setAvailableOrders(prev => prev.filter(o => o.orderId !== orderId));
                } else {
                    toast.error(message || 'Failed to accept order');
                }
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Socket.io Disconnected');
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket.io connection error:', error);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [session]);

    const acceptOrder = (order) => {
        if (socket && session) {
            setAccepting(order.orderId);
            socket.emit('order:accept', {
                orderId: order.orderId,
                partnerId: session.user.id
            });
        }
    };

    const dismissOrder = (orderId) => {
        setAvailableOrders(prev => prev.filter(o => o.orderId !== orderId));
        // Save to localStorage
        const updatedDismissed = [...dismissedOrders, orderId];
        setDismissedOrders(updatedDismissed);
        localStorage.setItem('dismissedOrders', JSON.stringify(updatedDismissed));
        console.log('Order dismissed and saved to localStorage:', orderId);
    };

    if (!session || session.user.role !== 'DELIVERY' || availableOrders.length === 0) {
        console.log('OrderNotifications not showing:', {
            hasSession: !!session,
            role: session?.user?.role,
            ordersCount: availableOrders.length
        });
        return null;
    }

    console.log('Rendering OrderNotifications with', availableOrders.length, 'orders');
    return (
        <div className="fixed top-20 right-6 z-50 space-y-4 max-w-lg max-h-[calc(100vh-6rem)] overflow-y-auto pr-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b981 #e5e7eb' }}
        >
            {availableOrders.map((order) => {
                const earnings = calculateOrderEarnings(order);
                const deliveryEarnings = earnings.totalEarning;
                const isCOD = order.paymentMethod === 'COD';

                return (
                    <div
                        key={order.orderId}
                        className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-2xl shadow-2xl border-4 border-green-500 overflow-hidden animate-slide-in-bounce relative"
                    >
                        {/* Pulsing indicator */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse-ring"></div>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Package className="w-6 h-6 animate-bounce" />
                                        <h3 className="font-bold text-xl">New Order Available!</h3>
                                    </div>
                                    <p className="text-sm font-mono opacity-90">#{order.orderNumber}</p>
                                </div>
                                <button
                                    onClick={() => dismissOrder(order.orderId)}
                                    className="p-2 hover:bg-white/20 rounded-full transition"
                                    title="Dismiss"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Earnings Highlight */}
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 text-center shadow-lg">
                                <p className="text-sm font-semibold text-gray-800 mb-1">Your Earnings</p>
                                <p className="text-3xl font-bold text-gray-900">₹{deliveryEarnings}</p>
                                <p className="text-xs text-gray-700 mt-1">Base ₹30 + Items ₹{order.items?.length * 5} + Distance ₹10</p>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-green-600" />
                                        <span className="font-bold text-gray-900">{order.items?.length} Items</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Order Total</p>
                                        <p className="text-xl font-bold text-green-700">₹{order.finalAmount}</p>
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                {isCOD && (
                                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mt-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-5 h-5 text-red-600" />
                                                <span className="font-bold text-red-900">Cash on Delivery</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-red-700">Collect Cash</p>
                                                <p className="text-2xl font-bold text-red-900">₹{order.finalAmount}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pickup Location */}
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-blue-900 uppercase mb-1">Pickup From</p>
                                        <p className="font-bold text-gray-900">FreshMart Store</p>
                                        <p className="text-sm text-gray-700">123 Main Street, City Center</p>
                                        <p className="text-sm text-gray-700">Mumbai, Maharashtra - 400001</p>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Location */}
                            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-green-900 uppercase mb-1">Deliver To</p>
                                        <p className="font-bold text-gray-900">{order.deliveryAddress?.fullName}</p>
                                        <p className="text-sm text-gray-700">{order.deliveryAddress?.addressLine1}</p>
                                        {order.deliveryAddress?.addressLine2 && (
                                            <p className="text-sm text-gray-700">{order.deliveryAddress.addressLine2}</p>
                                        )}
                                        <p className="text-sm text-gray-700">
                                            {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.zipCode}
                                        </p>
                                        {order.deliveryAddress?.instructions && (
                                            <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
                                                <p className="text-xs font-semibold text-yellow-900">📝 Instructions:</p>
                                                <p className="text-sm text-gray-800">{order.deliveryAddress.instructions}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => dismissOrder(order.orderId)}
                                    className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all"
                                    disabled={accepting === order.orderId}
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => acceptOrder(order)}
                                    disabled={accepting === order.orderId}
                                    className="flex-1 px-5 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {accepting === order.orderId ? (
                                        <>
                                            <Clock className="w-5 h-5 animate-spin" />
                                            Accepting...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-6 h-6" />
                                            Accept & Earn ₹{deliveryEarnings}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            <style jsx>{`
        @keyframes slide-in-bounce {
          0% {
            transform: translateX(120%);
            opacity: 0;
          }
          60% {
            transform: translateX(-10px);
            opacity: 1;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.5;
          }
        }
        .animate-slide-in-bounce {
          animation: slide-in-bounce 0.5s ease-out;
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
