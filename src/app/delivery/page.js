/* Instamart Rider Command Center with Live Route Map - v9.0 */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import LocationTracker from '@/components/delivery/LocationTracker';
import { Package, Truck, CheckCircle2, Clock, MapPin, Phone, Store, Navigation, CheckSquare, ExternalLink } from 'lucide-react';

// Dynamic Leaflet Map imports for browser
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

export default function DeliveryDashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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
            case 'CONFIRMED': return 1;
            case 'REACHED_STORE': return 2;
            case 'OUT_FOR_DELIVERY': return 3;
            case 'ARRIVED_AT_CUSTOMER': return 4;
            default: return 1;
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <DeliveryLayout session={session}>
            <div className="bg-gray-50 text-slate-900 font-sans p-4 max-w-5xl mx-auto space-y-4">

                {/* Top Clean Header */}
                <div className="bg-white px-5 py-3.5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight">Active Deliveries ({orders.length})</h1>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                        Rider: {session?.user?.name || 'Partner'}
                    </span>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm space-y-2">
                        <Package className="w-10 h-10 text-emerald-600 mx-auto" />
                        <h3 className="text-base font-bold text-slate-900">No active orders</h3>
                        <p className="text-xs text-gray-500">New order popups will appear automatically on your screen.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const currentStep = getStageStep(order.status);
                            const isCOD = order.paymentMethod === 'COD';
                            const addr = order.deliveryAddress || {};
                            const isAfterPickup = ['OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER'].includes(order.status);

                            const destLat = addr.latitude || 16.5062;
                            const destLng = addr.longitude || 80.6480;
                            const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;

                            return (
                                <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 space-y-3.5">

                                    {/* Order Row Top Bar */}
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-black text-sm text-slate-900">#{order.orderNumber}</span>
                                            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live GPS
                                            </span>
                                        </div>

                                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                                            Collect: ₹{order.finalAmount} ({order.paymentMethod})
                                        </span>
                                    </div>

                                    {/* Clean 4-Step Stage Tabs */}
                                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                                        {[
                                            { s: 1, label: '1. Store Hub' },
                                            { s: 2, label: '2. Picked Up' },
                                            { s: 3, label: '3. On The Way' },
                                            { s: 4, label: '4. Doorstep' }
                                        ].map(st => (
                                            <div
                                                key={st.s}
                                                className={`py-2 rounded-xl border transition ${st.s === currentStep
                                                        ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm'
                                                        : st.s < currentStep
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                            : 'bg-gray-50 text-gray-400 border-gray-200'
                                                    }`}
                                            >
                                                {st.label}
                                            </div>
                                        ))}
                                    </div>

                                    {/* 2-Column Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        {/* Store Pickup & Items */}
                                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                                            <div className="flex items-center gap-1.5 font-bold text-blue-900">
                                                <Store className="w-4 h-4 text-blue-600" />
                                                <span>Pickup Hub: FreshMart Central Dark Store</span>
                                            </div>
                                            <div className="space-y-1 divide-y divide-gray-200/80 pt-1">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="pt-1 flex items-center justify-between text-slate-800 font-medium">
                                                        <span className="flex items-center gap-1.5">
                                                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                                            {item.name}
                                                        </span>
                                                        <span className="font-mono font-bold text-slate-900">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Customer Destination & Phone */}
                                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                                    <span>Destination: {addr.fullName || 'Customer'}</span>
                                                </div>
                                                {addr.phone && (
                                                    <a href={`tel:${addr.phone}`} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> Call
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                                {[addr.addressLine1, addr.addressLine2, addr.city, addr.zipCode].filter(Boolean).join(', ')}
                                            </p>
                                            {addr.instructions && (
                                                <p className="text-[11px] text-amber-900 italic bg-amber-50 p-2 rounded-lg border border-amber-200">
                                                    Note: {addr.instructions}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* AFTER PICKUP: LIVE MAP & TURN-BY-TURN NAVIGATION */}
                                    {isAfterPickup && (
                                        <div className="bg-emerald-50/90 p-3.5 rounded-xl border border-emerald-200 space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 font-black text-xs text-emerald-950">
                                                    <Navigation className="w-4 h-4 text-emerald-600 animate-bounce" />
                                                    <span>AFTER PICKUP ROUTE • NAVIGATE TO CUSTOMER</span>
                                                </div>
                                                <a
                                                    href={mapUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    <span>Open Turn-by-Turn GPS Navigation</span>
                                                </a>
                                            </div>

                                            {/* Mini Leaflet Route Map */}
                                            <div className="h-48 rounded-xl overflow-hidden border border-emerald-300 shadow-inner">
                                                {typeof window !== 'undefined' && (
                                                    <MapContainer
                                                        center={[destLat, destLng]}
                                                        zoom={14}
                                                        style={{ height: '100%', width: '100%' }}
                                                    >
                                                        <TileLayer
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                            attribution="&copy; OpenStreetMap"
                                                        />
                                                        <Marker position={[destLat, destLng]}>
                                                            <Popup>
                                                                <b>{addr.fullName || 'Customer Address'}</b><br />
                                                                {addr.addressLine1}
                                                            </Popup>
                                                        </Marker>
                                                    </MapContainer>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Background GPS Tracker */}
                                    <LocationTracker orderId={order._id} />

                                    {/* Stage Action Button */}
                                    <div className="pt-1">
                                        {(order.status === 'PREPARING' || order.status === 'CONFIRMED') && (
                                            <button
                                                onClick={() => handleAction(order._id, 'reached_store', 'Reached Dark Store Hub')}
                                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                                            >
                                                <Store className="w-4 h-4" />
                                                <span>STAGE 1: MARK ARRIVED AT DARK STORE</span>
                                            </button>
                                        )}

                                        {order.status === 'REACHED_STORE' && (
                                            <button
                                                onClick={() => handleAction(order._id, 'pickup', 'Items Picked Up from Store')}
                                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                                            >
                                                <Package className="w-4 h-4" />
                                                <span>STAGE 2: MARK ITEMS PICKED UP & START RIDE</span>
                                            </button>
                                        )}

                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <button
                                                onClick={() => handleAction(order._id, 'arrived_at_customer', 'Arrived at Customer Doorstep')}
                                                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                                            >
                                                <Navigation className="w-4 h-4" />
                                                <span>STAGE 3: MARK ARRIVED AT CUSTOMER DOORSTEP</span>
                                            </button>
                                        )}

                                        {order.status === 'ARRIVED_AT_CUSTOMER' && (
                                            <button
                                                onClick={() => handleAction(order._id, 'deliver', `Order Delivered ${isCOD ? '& Collected ₹' + order.finalAmount : ''}`)}
                                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
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
