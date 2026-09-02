'use client';

import { useEffect, useRef } from 'react';

export default function LocationTracker({ orderId, onLocationUpdate }) {
    const currentLocationRef = useRef(null);

    useEffect(() => {
        if (!orderId) return;

        // Default Dark Store origin fallback (Vijayawada central hub)
        const defaultLocation = { latitude: 16.5030, longitude: 80.6400 };
        currentLocationRef.current = defaultLocation;

        // Immediately send initial location so backend has record
        sendLocationUpdate(defaultLocation);

        let watchId = null;

        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const loc = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    currentLocationRef.current = loc;
                    sendLocationUpdate(loc);
                },
                (err) => {
                    console.warn('Rider GPS notice:', err.message);
                    // Send default hub location if browser GPS fails/denied
                    sendLocationUpdate(defaultLocation);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }

        // Heartbeat timer every 5s to guarantee continuous backend sync
        const intervalId = setInterval(() => {
            if (currentLocationRef.current) {
                sendLocationUpdate(currentLocationRef.current);
            }
        }, 5000);

        return () => {
            if (watchId !== null && navigator.geolocation) {
                navigator.geolocation.clearWatch(watchId);
            }
            clearInterval(intervalId);
        };
    }, [orderId]);

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
            console.error('Error sending rider location update:', error);
        }
    };

    return null;
}
