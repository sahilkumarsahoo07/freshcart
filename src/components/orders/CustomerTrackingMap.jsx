'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const createMarkerIcon = (emoji, bgGradient) => {
    if (typeof window === 'undefined') return null;
    const L = require('leaflet');
    return L.divIcon({
        className: 'custom-map-icon',
        html: `
            <div class="relative flex items-center justify-center">
                <div class="${bgGradient} w-10 h-10 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-lg transform hover:scale-110 transition">
                    ${emoji}
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

function RecenterMap({ coveredCoords, pendingCoords, destPos }) {
    const map = useMap();
    useEffect(() => {
        const allCoords = [...coveredCoords, ...pendingCoords];
        if (allCoords.length > 0 && map) {
            map.fitBounds(allCoords, { padding: [40, 40] });
        } else if (destPos && map) {
            map.setView(destPos, 15);
        }
    }, [coveredCoords, pendingCoords, destPos, map]);
    return null;
}

export default function CustomerTrackingMap({ orderId, customerLat, customerLng, trackingData, partnerName, addressText }) {
    const [customerCoords, setCustomerCoords] = useState(
        customerLat && customerLng ? [customerLat, customerLng] : null
    );
    const [liveTracking, setLiveTracking] = useState(trackingData || null);
    const [coveredCoords, setCoveredCoords] = useState([]);
    const [pendingCoords, setPendingCoords] = useState([]);
    const [coveredDist, setCoveredDist] = useState(null);
    const [pendingDist, setPendingDist] = useState(null);
    const [pendingDur, setPendingDur] = useState(null);

    const storeOrigin = [16.5030, 80.6400]; // FreshMart Central Store Hub

    // Sync live tracking prop
    useEffect(() => {
        if (trackingData) setLiveTracking(trackingData);
    }, [trackingData]);

    // Continuous 3-second live polling for Customer
    useEffect(() => {
        if (!orderId) return;

        const fetchLiveTracking = async () => {
            try {
                const res = await fetch(`/api/delivery/location?orderId=${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.tracking) {
                        setLiveTracking(data.tracking);
                    }
                }
            } catch (err) {
                console.warn('Customer tracking poll notice:', err.message);
            }
        };

        fetchLiveTracking();
        const intervalId = setInterval(fetchLiveTracking, 6000);

        return () => clearInterval(intervalId);
    }, [orderId]);

    const riderPos = liveTracking?.currentLocation?.latitude && liveTracking?.currentLocation?.longitude
        ? [liveTracking.currentLocation.latitude, liveTracking.currentLocation.longitude]
        : storeOrigin;

    const bikeIconRef = useRef(null);
    const homeIconRef = useRef(null);
    const storeIconRef = useRef(null);

    if (typeof window !== 'undefined') {
        if (!bikeIconRef.current) {
            bikeIconRef.current = createMarkerIcon('🏍️', 'bg-emerald-600 text-white');
        }
        if (!homeIconRef.current) {
            homeIconRef.current = createMarkerIcon('🏠', 'bg-rose-600 text-white');
        }
        if (!storeIconRef.current) {
            storeIconRef.current = createMarkerIcon('🏬', 'bg-indigo-600 text-white');
        }
    }

    // Geocode customer written address if coordinates not in DB
    useEffect(() => {
        if (customerLat && customerLng) {
            setCustomerCoords([customerLat, customerLng]);
            return;
        }

        if (addressText) {
            geocodeAddress(addressText);
        } else {
            setCustomerCoords([16.5062, 80.6480]);
        }
    }, [customerLat, customerLng, addressText]);

    const geocodeAddress = async (queryText) => {
        try {
            const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}&limit=1`;
            const res = await fetch(searchUrl, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) return;
            const data = await res.json();
            if (data && data[0]) {
                setCustomerCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            } else {
                setCustomerCoords([16.5062, 80.6480]);
            }
        } catch (error) {
            setCustomerCoords([16.5062, 80.6480]);
        }
    };

    // Fetch OSRM Roadway routes once customerCoords resolved
    useEffect(() => {
        if (!customerCoords) return;
        fetchCoveredAndPendingRoutes(storeOrigin, riderPos, customerCoords);
    }, [riderPos[0], riderPos[1], customerCoords]);

    const fetchCoveredAndPendingRoutes = async (store, rider, customer) => {
        try {
            // Covered Path (Store -> Rider)
            const coveredUrl = `https://router.project-osrm.org/route/v1/driving/${store[1]},${store[0]};${rider[1]},${rider[0]}?overview=full&geometries=geojson`;
            const coveredRes = await fetch(coveredUrl);
            if (coveredRes.ok) {
                const data = await coveredRes.json();
                if (data.routes && data.routes[0]) {
                    const leafletRoute = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                    setCoveredCoords(leafletRoute);
                    setCoveredDist(data.routes[0].distance / 1000);
                }
            }

            // Pending Path (Rider -> Customer)
            const pendingUrl = `https://router.project-osrm.org/route/v1/driving/${rider[1]},${rider[0]};${customer[1]},${customer[0]}?overview=full&geometries=geojson`;
            const pendingRes = await fetch(pendingUrl);
            if (pendingRes.ok) {
                const data = await pendingRes.json();
                if (data.routes && data.routes[0]) {
                    const leafletRoute = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                    setPendingCoords(leafletRoute);
                    setPendingDist(data.routes[0].distance / 1000);
                    setPendingDur(Math.round(data.routes[0].duration / 60));
                }
            }
        } catch (error) {
            console.warn('Covered & Pending route fetch notice:', error.message);
        }
    };

    if (!customerCoords) {
        return (
            <div className="h-80 sm:h-96 rounded-2xl bg-emerald-50/50 animate-pulse border border-emerald-200 flex flex-col items-center justify-center gap-2 p-6 text-center">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black text-emerald-950">Locating Customer Doorstep...</p>
                <p className="text-[11px] text-slate-500">Resolving precise address coordinates</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Real-time Distance Covered & Remaining Header */}
            <div className="bg-emerald-50/90 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-emerald-600 animate-bounce" />
                        <div>
                            <span className="font-black text-xs text-emerald-950 block">LIVE RIDER ROUTE TRACKER</span>
                            <span className="text-[11px] font-bold text-emerald-700">
                                {partnerName ? `Rider: ${partnerName}` : 'Delivery Partner Assigned'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {coveredDist !== null && (
                            <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-[11px] font-extrabold shadow-xs">
                                ✓ {coveredDist.toFixed(1)} KM Covered
                            </span>
                        )}
                        {pendingDist !== null && (
                            <span className="bg-orange-500 text-white px-2.5 py-1 rounded-xl text-[11px] font-extrabold shadow-xs">
                                ⏳ {pendingDist.toFixed(1)} KM Pending (~{pendingDur} mins)
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress bar visual indicator */}
                {coveredDist !== null && pendingDist !== null && (
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div
                            className="bg-emerald-600 h-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, (coveredDist / (coveredDist + pendingDist || 1)) * 100))}%` }}
                        ></div>
                        <div className="bg-orange-400 h-full flex-1"></div>
                    </div>
                )}
            </div>

            {/* Customer Map Viewport */}
            <div className="h-80 sm:h-96 rounded-2xl overflow-hidden border border-emerald-300 shadow-inner relative z-0">
                <MapContainer
                    center={customerCoords}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap"
                    />

                    {/* Dark Store Pin (🏬) */}
                    <Marker position={storeOrigin} icon={storeIconRef.current || undefined}>
                        <Popup>
                            <div className="text-xs font-sans">
                                <b>🏬 FreshMart Dark Store Hub</b>
                                <p className="text-[11px] text-slate-500">Order pickup location</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Customer House Pin (🏠) */}
                    <Marker position={customerCoords} icon={homeIconRef.current || undefined}>
                        <Popup>
                            <div className="text-xs font-sans">
                                <b>🏠 Your Delivery Doorstep</b>
                                <p className="text-[11px] text-gray-600">{addressText}</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Rider Live Bike Pin (🏍️) */}
                    <Marker position={riderPos} icon={bikeIconRef.current || undefined}>
                        <Popup>
                            <div className="text-xs font-sans">
                                <b>🏍️ {partnerName || 'Delivery Partner'} (Live Rider)</b>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Covered Path (Solid Dark Green Line) */}
                    {coveredCoords.length > 0 && (
                        <Polyline
                            positions={coveredCoords}
                            color="#059669"
                            weight={5}
                            opacity={0.9}
                        />
                    )}

                    {/* Pending Path (Dashed Orange Line) */}
                    {pendingCoords.length > 0 && (
                        <Polyline
                            positions={pendingCoords}
                            color="#F97316"
                            weight={5}
                            opacity={0.85}
                            dashArray="8, 8"
                        />
                    )}

                    <RecenterMap coveredCoords={coveredCoords} pendingCoords={pendingCoords} destPos={customerCoords} />
                </MapContainer>
            </div>
        </div>
    );
}
