'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom Marker Icons for Leaflet
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

function RecenterMap({ routeCoords, destPos }) {
    const map = useMap();
    useEffect(() => {
        if (routeCoords && routeCoords.length > 0 && map) {
            map.fitBounds(routeCoords, { padding: [40, 40] });
        } else if (destPos && map) {
            map.setView(destPos, 15);
        }
    }, [routeCoords, destPos, map]);
    return null;
}

export default function DeliveryRouteMap({ destLat, destLng, customerName, addressText }) {
    const [riderPos, setRiderPos] = useState(null);
    const [customerCoords, setCustomerCoords] = useState(
        destLat && destLng ? [destLat, destLng] : null
    );
    const [routeCoords, setRouteCoords] = useState([]);
    const [roadDistance, setRoadDistance] = useState(null);
    const [roadDuration, setRoadDuration] = useState(null);
    const watchIdRef = useRef(null);

    // Default Dark Store origin fallback (Vijayawada hub)
    const storeOrigin = [16.5030, 80.6400];

    const bikeIconRef = useRef(null);
    const homeIconRef = useRef(null);

    if (typeof window !== 'undefined') {
        if (!bikeIconRef.current) {
            bikeIconRef.current = createMarkerIcon('🏍️', 'bg-emerald-600 text-white');
        }
        if (!homeIconRef.current) {
            homeIconRef.current = createMarkerIcon('🏠', 'bg-rose-600 text-white');
        }
    }

    // 1. Live Geocode customer written address if lat/lng are missing
    useEffect(() => {
        if (destLat && destLng) {
            setCustomerCoords([destLat, destLng]);
            return;
        }

        if (addressText) {
            geocodeAddress(addressText);
        } else {
            setCustomerCoords([16.5062, 80.6480]); // Default fallback
        }
    }, [destLat, destLng, addressText]);

    const geocodeAddress = async (queryText) => {
        try {
            const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}&limit=1`;
            const res = await fetch(searchUrl, {
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data && data[0]) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setCustomerCoords([lat, lon]);
            } else {
                setCustomerCoords([16.5062, 80.6480]);
            }
        } catch (error) {
            console.warn('Address geocoding notice:', error.message);
            setCustomerCoords([16.5062, 80.6480]);
        }
    };

    // 2. Track Rider GPS
    useEffect(() => {
        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    if (lat && lng) {
                        setRiderPos([lat, lng]);
                    }
                },
                (err) => console.warn('Rider GPS notice:', err.message),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }

        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // 3. Fetch OSRM Roadway driving route once customer coordinates are resolved
    useEffect(() => {
        if (!customerCoords) return;
        const start = riderPos || storeOrigin;
        fetchRoadWayRoute(start[0], start[1], customerCoords[0], customerCoords[1]);
    }, [riderPos, customerCoords]);

    const fetchRoadWayRoute = async (startLat, startLng, endLat, endLng) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            if (!res.ok) return;
            const data = await res.json();

            if (data.routes && data.routes[0]) {
                const geoJsonCoords = data.routes[0].geometry.coordinates;
                const leafletRoute = geoJsonCoords.map(([lng, lat]) => [lat, lng]);
                setRouteCoords(leafletRoute);

                const distKm = data.routes[0].distance / 1000;
                const durMins = Math.round(data.routes[0].duration / 60);
                setRoadDistance(distKm);
                setRoadDuration(durMins);
            }
        } catch (error) {
            console.warn('OSRM roadway route fetch notice:', error.message);
        }
    };

    const currentOrigin = riderPos || storeOrigin;
    const activeDest = customerCoords || [16.5062, 80.6480];
    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentOrigin[0]},${currentOrigin[1]}&destination=${activeDest[0]},${activeDest[1]}&travelmode=driving`;

    return (
        <div className="bg-emerald-50/90 p-3.5 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-600 animate-bounce" />
                    <div>
                        <span className="font-black text-xs text-emerald-950 block">ROADWAY DRIVING ROUTE • NAVIGATE TO CUSTOMER</span>
                        {roadDistance !== null ? (
                            <span className="text-[11px] font-extrabold text-emerald-700">
                                Road Distance: {roadDistance.toFixed(1)} KM (~{roadDuration} mins drive)
                            </span>
                        ) : (
                            <span className="text-[11px] font-bold text-slate-500">
                                Geocoding Customer Address & Route...
                            </span>
                        )}
                    </div>
                </div>

                <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Turn-by-Turn GPS Navigation</span>
                </a>
            </div>

            {/* Interactive Leaflet Map with Dynamic Address Geocoding */}
            <div className="h-80 sm:h-96 rounded-2xl overflow-hidden border border-emerald-300 shadow-inner relative z-0">
                <MapContainer
                    center={activeDest}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap"
                    />

                    {/* Customer Destination House Marker (🏠 Red Circle at Geocoded Customer Address) */}
                    <Marker position={activeDest} icon={homeIconRef.current || undefined}>
                        <Popup>
                            <div className="text-xs font-sans">
                                <b>🏠 Customer: {customerName || 'Delivery Address'}</b>
                                <p className="text-[11px] text-gray-600">{addressText}</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Rider Bike Marker (🏍️ Green Circle) */}
                    <Marker position={currentOrigin} icon={bikeIconRef.current || undefined}>
                        <Popup>
                            <div className="text-xs font-sans">
                                <b>{riderPos ? '🏍️ Live Rider GPS Position' : '🏬 FreshMart Dark Store Hub'}</b>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Real Roadway Polyline Following Streets & Turns */}
                    {routeCoords.length > 0 && (
                        <Polyline
                            positions={routeCoords}
                            color="#059669"
                            weight={5}
                            opacity={0.85}
                        />
                    )}

                    <RecenterMap routeCoords={routeCoords} destPos={activeDest} />
                </MapContainer>
            </div>
        </div>
    );
}
