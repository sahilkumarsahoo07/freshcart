'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Package, Clock, MapPin, X, Check, Navigation, Phone, Zap } from 'lucide-react';
import { calculateOrderEarnings } from '@/lib/earningsCalculator';

// Standard City Coordinate Dictionary
const CITY_COORDINATES = {
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'vijayawada': { lat: 16.5062, lng: 80.6480 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'bengaluru': { lat: 12.9716, lng: 77.5946 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 }
};

// Accurate Haversine Distance Formula in KM
function getAccurateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return Math.round(dist * 10) / 10;
}

export default function OrderNotifications() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [socket, setSocket] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [accepting, setAccepting] = useState(null);
    const [driverCoords, setDriverCoords] = useState(null);
    const [geocodedAddresses, setGeocodedAddresses] = useState({});
    const [dismissedOrders, setDismissedOrders] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dismissedOrders');
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    });

    // Continuous Live High-Accuracy Driver GPS Stream
    useEffect(() => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setDriverCoords({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                },
                (err) => console.warn('GPS location notice:', err.message),
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'DELIVERY') {
            const fetchExistingOrders = async () => {
                try {
                    const res = await fetch('/api/delivery/available-orders');
                    const data = await res.json();
                    if (data.success && data.orders.length > 0) {
                        const filteredOrders = data.orders.filter(
                            order => !dismissedOrders.includes(order.orderId)
                        );
                        setAvailableOrders(filteredOrders);
                    }
                } catch (error) {
                    console.error('Error fetching existing orders:', error);
                }
            };
            fetchExistingOrders();

            if (process.env.NEXT_PUBLIC_SOCKET_ENABLED === 'true') {
                try {
                    const newSocket = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
                        path: '/api/socket',
                        reconnectionAttempts: 2,
                        timeout: 5000,
                    });

                    newSocket.on('connect', () => {
                        newSocket.emit('delivery:register', session.user.id);
                    });

                    newSocket.on('order:new', (order) => {
                        setAvailableOrders(prev => {
                            const exists = prev.some(o => o.orderId === order.orderId);
                            if (exists) return prev;
                            return [...prev, order];
                        });
                    });

                    newSocket.on('order:assigned', ({ orderId }) => {
                        setAvailableOrders(prev => prev.filter(o => o.orderId !== orderId));
                    });

                    setSocket(newSocket);
                    return () => newSocket.close();
                } catch (e) {
                    console.warn('OrderNotifications socket notice:', e.message);
                }
            }
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
        const updatedDismissed = [...dismissedOrders, orderId];
        setDismissedOrders(updatedDismissed);
        localStorage.setItem('dismissedOrders', JSON.stringify(updatedDismissed));
    };

    if (!session || session.user.role !== 'DELIVERY' || availableOrders.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-20 right-4 z-50 space-y-3.5 w-80 sm:w-96 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            {availableOrders.map((order) => {
                const earnings = calculateOrderEarnings(order);
                const deliveryEarnings = earnings.totalEarning;
                const isCOD = order.paymentMethod === 'COD';
                const addr = order.deliveryAddress || {};

                // Explicit Latitude & Longitude check
                const hasExplicitCoords = addr.latitude && addr.longitude;

                let finalDistanceKm = 0.1; // Default same-location distance for local dark store orders
                let estMins = 1;

                if (hasExplicitCoords && driverCoords) {
                    const exactHaversine = getAccurateHaversineDistance(
                        driverCoords.lat,
                        driverCoords.lng,
                        addr.latitude,
                        addr.longitude
                    );
                    if (exactHaversine !== null && exactHaversine > 0) {
                        finalDistanceKm = exactHaversine;
                        estMins = Math.max(1, Math.round(finalDistanceKm * 3));
                    }
                } else if (order.distanceKm && order.distanceKm < 3) {
                    finalDistanceKm = order.distanceKm;
                    estMins = Math.max(1, Math.round(finalDistanceKm * 3));
                }

                const fullCustomerAddress = [
                    addr.addressLine1,
                    addr.addressLine2,
                    addr.city,
                    addr.state,
                    addr.zipCode
                ].filter(Boolean).join(', ');

                return (
                    <div
                        key={order.orderId}
                        className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-emerald-500/30 overflow-hidden animate-slide-in-bounce relative font-sans text-slate-900"
                    >
                        {/* Top Gradient Header Accent Bar */}
                        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-3 text-white flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200 animate-pulse" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-xs uppercase tracking-wider text-white">New Order Request</h3>
                                        <span className="text-[9px] font-extrabold bg-emerald-400/30 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/30">
                                            LIVE
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-mono text-emerald-100/90 mt-0.5">#{order.orderNumber || order.orderId.slice(-6)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => dismissOrder(order.orderId)}
                                className="p-1.5 hover:bg-white/20 rounded-xl text-emerald-100 hover:text-white transition"
                                title="Dismiss Order"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 space-y-3.5">
                            {/* Hero Earnings Card */}
                            <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex items-center justify-between border border-emerald-700/50">
                                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

                                <div>
                                    <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider block">Your Payout</span>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="text-3xl font-black text-white tracking-tight">₹{deliveryEarnings}</span>
                                        <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded-md ml-1 border border-emerald-600/50">
                                            Guaranteed
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                                    <div className="flex items-center justify-end gap-1 text-emerald-300 font-extrabold text-xs">
                                        <Navigation className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300" />
                                        <span>{finalDistanceKm} KM</span>
                                    </div>
                                    <span className="text-[10px] text-slate-300 font-bold block mt-0.5">
                                        {finalDistanceKm <= 0.3 ? '📍 Same Location' : `~${estMins} Mins Drive`}
                                    </span>
                                </div>
                            </div>

                            {/* Order Details Badge */}
                            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-200/80 text-xs font-bold">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Package className="w-4 h-4 text-emerald-600" />
                                    <span>{order.items?.length || 1} Items Packed</span>
                                </div>
                                <div className="text-slate-900 font-black text-sm">
                                    <span className="text-slate-500 font-medium text-xs mr-1">Total:</span>
                                    ₹{order.finalAmount}
                                </div>
                            </div>

                            {isCOD && (
                                <div className="flex items-center justify-between text-xs font-black text-rose-800 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                                    <span>💵 Cash on Delivery</span>
                                    <span>Collect ₹{order.finalAmount}</span>
                                </div>
                            )}

                            {/* Customer Delivery Location Box */}
                            <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200/80 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-black text-xs text-emerald-950">
                                        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <span>DELIVER TO: {addr.fullName || 'Customer'}</span>
                                    </div>
                                    {addr.phone && (
                                        <a href={`tel:${addr.phone}`} className="flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-200/80 hover:bg-emerald-300/80 px-2.5 py-1 rounded-full border border-emerald-300 transition">
                                            <Phone className="w-3 h-3" />
                                            <span>Call</span>
                                        </a>
                                    )}
                                </div>

                                <p className="text-xs text-slate-800 leading-relaxed font-semibold pl-6 break-words">
                                    {fullCustomerAddress || 'Customer address provided'}
                                </p>

                                {addr.instructions && (
                                    <div className="mt-1.5 p-2 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px]">
                                        <p className="font-black text-amber-900">📝 Delivery Instructions:</p>
                                        <p className="text-slate-800 font-semibold italic">{addr.instructions}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2.5 pt-1">
                                <button
                                    onClick={() => dismissOrder(order.orderId)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition border border-slate-200"
                                    disabled={accepting === order.orderId}
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => acceptOrder(order)}
                                    disabled={accepting === order.orderId}
                                    className="flex-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    {accepting === order.orderId ? (
                                        <>
                                            <Clock className="w-4 h-4 animate-spin" />
                                            <span>Accepting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 stroke-[3]" />
                                            <span>ACCEPT ORDER • ₹{deliveryEarnings}</span>
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
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    100% {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in-bounce {
                    animation: slide-in-bounce 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
