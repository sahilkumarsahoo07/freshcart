/* Instamart Ultra-Premium Light Rider Command Center - v10.0 */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import LocationTracker from '@/components/delivery/LocationTracker';
import { Package, Truck, CheckCircle2, Clock, MapPin, Phone, Store, Navigation, CheckSquare, ChevronRight, ShieldCheck, Filter } from 'lucide-react';

// Dynamic import for Leaflet Route Map component to avoid SSR window errors
const DeliveryRouteMap = dynamic(() => import('@/components/delivery/DeliveryRouteMap'), {
    ssr: false,
    loading: () => (
        <div className="h-80 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-slate-400">
            Loading Live Route Map...
        </div>
    ),
});

export default function DeliveryDashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            if (session.user.role !== 'DELIVERY') {
                router.push('/');
                return;
            }
            fetchOrders();
        }
    }, [status, session, router]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/delivery/orders');
            const data = await res.json();
            const activeOrders = (data.orders || []).filter(o => o.status !== 'DELIVERED');
            setOrders(activeOrders);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const handleAction = async (orderId, actionName, labelText) => {
        try {
            const res = await fetch(`/api/delivery/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: actionName }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update order');
            }

            toast.success(`Updated: ${labelText}`);
            fetchOrders();
        } catch (error) {
            toast.error(error.message || 'Failed to update order');
        }
    };

    const getStageStep = (status) => {
        switch (status) {
            case 'PREPARING':
            case 'CONFIRMED':
            case 'PLACED': return 1;
            case 'REACHED_STORE': return 2;
            case 'OUT_FOR_DELIVERY': return 3;
            case 'ARRIVED_AT_CUSTOMER': return 4;
            default: return 1;
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'STORE') return ['PREPARING', 'CONFIRMED', 'PLACED', 'REACHED_STORE'].includes(order.status);
        if (activeTab === 'RIDE') return ['OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER'].includes(order.status);
        return true;
    });

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-slate-500">Loading Rider Command Center...</span>
                </div>
            </div>
        );
    }

    return (
        <DeliveryLayout session={session}>
            <div className="bg-slate-50/80 text-slate-900 font-sans p-3 sm:p-5 max-w-5xl mx-auto space-y-4">

                {/* Dashboard Top Hero Card */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Delivery Dashboard</h1>
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Rider
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Instamart Real-Time 4-Stage Order Tracking System</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
                        {[
                            { key: 'ALL', label: `All Active (${orders.length})` },
                            { key: 'STORE', label: 'Store Pickup' },
                            { key: 'RIDE', label: 'On The Ride' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${activeTab === tab.key
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                            <Package className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-black text-slate-900">No active deliveries in this section</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">New incoming customer orders will appear automatically on your screen.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const currentStep = getStageStep(order.status);
                            const isCOD = order.paymentMethod === 'COD';
                            const addr = order.deliveryAddress || {};
                            const isAfterPickup = ['OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER'].includes(order.status);

                            return (
                                <div key={order._id} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-4 sm:p-5 space-y-4">

                                    {/* Top Order Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                                                #{order.orderNumber}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                                                Collect: ₹{order.finalAmount} ({order.paymentMethod})
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visual 4-Stage Stepper Bar */}
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                                        <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-black">
                                            {[
                                                { s: 1, label: '1. Store Hub' },
                                                { s: 2, label: '2. Picked Up' },
                                                { s: 3, label: '3. On The Way' },
                                                { s: 4, label: '4. Doorstep' }
                                            ].map(st => (
                                                <div
                                                    key={st.s}
                                                    className={`py-1.5 px-1 rounded-xl border transition ${st.s === currentStep
                                                            ? 'bg-emerald-600 text-white border-emerald-600 font-black shadow-sm'
                                                            : st.s < currentStep
                                                                ? 'bg-emerald-100/70 text-emerald-900 border-emerald-200 font-bold'
                                                                : 'bg-white text-slate-400 border-slate-200 font-medium'
                                                        }`}
                                                >
                                                    {st.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2-Column Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        {/* Left Card: Store Pickup & Items Checklist */}
                                        <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                                                    <Store className="w-4 h-4 text-blue-600" />
                                                    <span>FreshMart Central Dark Store</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                                    Store Hub
                                                </span>
                                            </div>
                                            <div className="space-y-1.5 pt-0.5">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-slate-700 font-medium">
                                                        <span className="flex items-center gap-1.5 text-xs">
                                                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                                            <span className="truncate">{item.name}</span>
                                                        </span>
                                                        <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Card: Customer Destination & Call Action */}
                                        <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                                    <span className="truncate">Customer: {addr.fullName || 'User'}</span>
                                                </div>
                                                {addr.phone && (
                                                    <a
                                                        href={`tel:${addr.phone}`}
                                                        className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-xs"
                                                    >
                                                        <Phone className="w-3 h-3" /> Call
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                {[addr.addressLine1, addr.addressLine2, addr.city, addr.zipCode].filter(Boolean).join(', ')}
                                            </p>
                                            {addr.instructions && (
                                                <p className="text-[11px] text-amber-900 italic bg-amber-50 p-2 rounded-xl border border-amber-200/80">
                                                    Note: {addr.instructions}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* AFTER PICKUP ROUTE MAP COMPONENT */}
                                    {isAfterPickup && (
                                        <DeliveryRouteMap
                                            destLat={addr.latitude}
                                            destLng={addr.longitude}
                                            customerName={addr.fullName}
                                            addressText={[addr.addressLine1, addr.city].filter(Boolean).join(', ')}
                                        />
                                    )}

                                    {/* Silent Background GPS Tracker */}
                                    <LocationTracker orderId={order._id} />

                                    {/* Stage Action Button */}
                                    <div className="pt-1">
                                        {(order.status === 'PREPARING' || order.status === 'CONFIRMED' || order.status === 'PLACED') && (
                                            <button
                                                onClick={() => handleAction(order._id, 'reached_store', 'Reached Dark Store Hub')}
                                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 tracking-wide"
                                            >
                                                <Store className="w-4 h-4" />
                                                <span>STAGE 1: MARK ARRIVED AT DARK STORE</span>
                                            </button>
                                        )}

                                        {order.status === 'REACHED_STORE' && (
                                            <button
                                                onClick={() => handleAction(order._id, 'pickup', 'Items Picked Up from Store')}
                                                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 tracking-wide"
                                            >
                                                <Package className="w-4 h-4" />
                                                <span>STAGE 2: MARK ITEMS PICKED UP & START RIDE</span>
                                            </button>
                                        )}

                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <button
                                                onClick={() => handleAction(order._id, 'arrived_at_customer', 'Arrived at Customer Doorstep')}
                                                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 tracking-wide"
                                            >
                                                <Navigation className="w-4 h-4" />
                                                <span>STAGE 3: MARK ARRIVED AT CUSTOMER DOORSTEP</span>
                                            </button>
                                        )}

                                        {order.status === 'ARRIVED_AT_CUSTOMER' && (
                                            <button
                                                onClick={() => handleAction(order._id, 'deliver', `Order Delivered ${isCOD ? '& Collected ₹' + order.finalAmount : ''}`)}
                                                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 tracking-wide"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>STAGE 4: CONFIRM DELIVERED {isCOD ? `(COLLECT ₹${order.finalAmount})` : ''}</span>
                                            </button>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DeliveryLayout>
    );
}
