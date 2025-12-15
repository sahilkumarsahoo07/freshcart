'use client';

import { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Loader, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LocationTracker({ orderId, onLocationUpdate }) {
    const [isTracking, setIsTracking] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const watchIdRef = useRef(null);
    const updateIntervalRef = useRef(null);

    useEffect(() => {
        if (orderId) {
            startTracking();
        }

        return () => {
            stopTracking();
        };
    }, [orderId]);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            toast.error('Geolocation not supported');
            return;
        }

        setIsTracking(true);
        setError(null);

        // Watch position for continuous updates
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setCurrentLocation(location);
                setError(null);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setError(error.message);
                toast.error('Failed to get location');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

        // Send location updates every 15 seconds
        updateIntervalRef.current = setInterval(() => {
            if (currentLocation) {
                sendLocationUpdate(currentLocation);
            }
        }, 15000);

        console.log('✅ Location tracking started for order:', orderId);
    };

    const stopTracking = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
            updateIntervalRef.current = null;
        }

        setIsTracking(false);
        console.log('❌ Location tracking stopped');
    };

    const sendLocationUpdate = async (location) => {
        try {
            const res = await fetch('/api/delivery/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    latitude: location.latitude,
                    longitude: location.longitude,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to update location');
            }

            const data = await res.json();
            setLastUpdate(new Date());

            if (onLocationUpdate) {
                onLocationUpdate(data.tracking);
            }

            console.log('📍 Location updated:', data.tracking);
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    // Send initial location immediately when available
    useEffect(() => {
        if (currentLocation && !lastUpdate) {
            sendLocationUpdate(currentLocation);
        }
    }, [currentLocation]);

    if (!orderId) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}>
                    <Navigation className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">Live Location Tracking</h3>
                    <p className="text-sm text-gray-600">
                        {isTracking ? 'Sharing your location with customer' : 'Location tracking inactive'}
                    </p>
                </div>
                {isTracking && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-700">Live</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-red-900 text-sm">Location Error</p>
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            onClick={startTracking}
                            className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700 underline"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {currentLocation && (
                <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            <span className="font-semibold">Current Location</span>
                        </div>
                        <p className="text-xs font-mono text-gray-700">
                            Lat: {currentLocation.latitude.toFixed(6)}, Lng: {currentLocation.longitude.toFixed(6)}
                        </p>
                    </div>

                    {lastUpdate && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold">Last Update</span>
                            </div>
                            <p className="text-xs text-gray-700">
                                {lastUpdate.toLocaleTimeString()}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {!isTracking && !error && (
                <button
                    onClick={startTracking}
                    className="w-full mt-4 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2"
                >
                    <Navigation className="w-5 h-5" />
                    Start Location Sharing
                </button>
            )}

            {isTracking && (
                <button
                    onClick={stopTracking}
                    className="w-full mt-4 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                    Stop Tracking
                </button>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                    <strong>ℹ️ Note:</strong> Your location is shared with the customer every 15 seconds while tracking is active.
                    This helps them see your real-time progress.
                </p>
            </div>
        </div>
    );
}
