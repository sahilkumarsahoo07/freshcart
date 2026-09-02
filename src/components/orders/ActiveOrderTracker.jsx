'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Package, Truck, Clock, MapPin, Phone, X, ChevronRight, RefreshCw } from 'lucide-react';

export default function ActiveOrderPopup() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [activeOrders, setActiveOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            fetchActiveOrders();
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
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-105 p-3.5 flex items-center gap-3 animate-bounce"
                >
                    <Package className="w-5 h-5" />
                    <span className="font-extrabold text-xs pr-1">{activeOrders.length} Active Order{activeOrders.length > 1 ? 's' : ''}</span>
                    {activeOrders.some(o => o.status === 'OUT_FOR_DELIVERY') && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping"></div>
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
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <Package className="w-6 h-6" />
                                    Active Orders
                                </h2>
                                <p className="text-xs opacity-90 mt-0.5">{activeOrders.length} order{activeOrders.length > 1 ? 's' : ''} in progress</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetchActiveOrders}
                                    className="p-2 hover:bg-white/20 rounded-xl transition"
                                    title="Refresh"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4 space-y-3">
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
                                        className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-3"
                                    >
                                        {/* Order Header */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-black text-slate-900 text-base">#{order.orderNumber}</p>
                                                <p className="text-xs text-slate-500 font-medium">{order.items?.length} items • ₹{order.finalAmount}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-400" />
                                        </div>

                                        {/* Status Progress */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1 rounded-full ${statusInfo.color}`}>
                                                        <StatusIcon className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                    <span className="font-extrabold text-slate-900">{statusInfo.text}</span>
                                                </div>
                                                <span className="font-mono font-bold text-slate-500">{statusInfo.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${statusInfo.color} transition-all duration-500`}
                                                    style={{ width: `${statusInfo.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Delivery Partner */}
                                        {order.assignedDeliveryPartner && (
                                            <div className="flex items-center gap-3 p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-100">
                                                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-xs">
                                                    {order.assignedDeliveryPartner.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-extrabold text-slate-900 text-xs">{order.assignedDeliveryPartner.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">Assigned Delivery Partner</p>
                                                </div>
                                                {order.assignedDeliveryPartner.phone && order.status === 'OUT_FOR_DELIVERY' && (
                                                    <a
                                                        href={`tel:${order.assignedDeliveryPartner.phone}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-xs"
                                                    >
                                                        <Phone className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Delivery Address */}
                                        <div className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                                            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
                                            <p className="line-clamp-1">
                                                {[order.deliveryAddress?.addressLine1, order.deliveryAddress?.city].filter(Boolean).join(', ')}
                                            </p>
                                        </div>

                                        {/* Live Indicator */}
                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded-xl border border-orange-200 text-xs font-bold">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                                                <p>🚚 On the way to your doorstep!</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-100 p-4 bg-slate-50">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push('/my-orders');
                                }}
                                className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition"
                            >
                                View All Orders
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
