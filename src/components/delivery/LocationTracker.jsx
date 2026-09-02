'use client';

import { useState, useEffect, useRef } from 'react';

export default function LocationTracker({ orderId, onLocationUpdate }) {
    const [currentLocation, setCurrentLocation] = useState(null);
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
        if (!navigator.geolocation) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setCurrentLocation(location);
            },
            (err) => {
                console.warn('GPS location notice:', err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

        updateIntervalRef.current = setInterval(() => {
            if (currentLocation) {
                sendLocationUpdate(currentLocation);
            }
        }, 15000);
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

            if (res.ok) {
                const data = await res.json();
                if (onLocationUpdate) onLocationUpdate(data.tracking);
            }
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    useEffect(() => {
        if (currentLocation) {
            sendLocationUpdate(currentLocation);
        }
    }, [currentLocation]);

    // Pure background tracker - zero UI footprint to prevent card clutter
    return null;
}
