'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, Loader, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet with Next.js
if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

const defaultCenter = [19.076, 72.8777]; // Mumbai default

// Component to handle map clicks and marker dragging
function LocationMarker({ position, setPosition, onLocationChange }) {
    const map = useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            onLocationChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    setPosition([pos.lat, pos.lng]);
                    onLocationChange(pos.lat, pos.lng);
                },
            }}
        />
    ) : null;
}

export default function AddressMap({ onLocationSelect, initialLocation }) {
    const [position, setPosition] = useState(
        initialLocation ? [initialLocation.lat, initialLocation.lng] : defaultCenter
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [locationDenied, setLocationDenied] = useState(false);
    const mapRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Reverse geocode to get address from coordinates
    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
                {
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Geocoding failed');
            }

            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                const addressData = {
                    formattedAddress: data.display_name,
                    latitude: lat,
                    longitude: lng,
                    street: `${addr.house_number || ''} ${addr.road || addr.street || addr.residential || ''}`.trim() || data.display_name.split(',')[0],
                    landmark: addr.suburb || addr.neighbourhood || addr.hamlet || addr.building || addr.amenity || '',
                    city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
                    state: addr.state || addr.region || '',
                    pincode: addr.postcode || '',
                };

                console.log('Reverse geocoded address:', addressData);
                onLocationSelect(addressData);
                toast.success('Address detected!');
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            toast.error('Failed to get address. Please try again.');
        }
    };

    const handleLocationChange = useCallback((lat, lng) => {
        reverseGeocode(lat, lng);
    }, []);

    // Live search as user types (like Google Maps autocomplete)
    const handleSearchInput = (value) => {
        setSearchQuery(value);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // If query is too short, don't search
        if (value.trim().length < 3) {
            setShowResults(false);
            setSearchResults([]);
            return;
        }

        // Debounce search - wait 500ms after user stops typing
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(value);
        }, 500);
    };

    // Perform the actual search
    const performSearch = async (query) => {
        if (!query.trim()) {
            return;
        }

        setSearching(true);
        setShowResults(true);

        try {
            // Search with multiple strategies for better results
            const searches = [
                // Search 1: General search with more results
                fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10`,
                    { headers: { 'Accept': 'application/json' } }
                ),
                // Search 2: Structured search if query contains comma
                query.includes(',') ? fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&dedupe=1`,
                    { headers: { 'Accept': 'application/json' } }
                ) : null,
            ].filter(Boolean);

            const responses = await Promise.all(searches);
            const allResults = await Promise.all(responses.map(r => r.json()));

            // Combine and deduplicate results
            const combinedResults = [];
            const seen = new Set();

            allResults.forEach(results => {
                results.forEach(result => {
                    const key = `${result.lat},${result.lon}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        combinedResults.push(result);
                    }
                });
            });

            if (combinedResults.length > 0) {
                setSearchResults(combinedResults.slice(0, 10)); // Limit to 10 results
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setPosition([lat, lng]);
        setShowResults(false);
        setSearchQuery(result.display_name.split(',').slice(0, 2).join(', '));
        setSearchResults([]);

        // Pan map to selected location
        if (mapRef.current) {
            mapRef.current.setView([lat, lng], 17);
        }

        // Extract address from search result
        const addr = result.address || {};
        const addressData = {
            formattedAddress: result.display_name,
            latitude: lat,
            longitude: lng,
            street: `${addr.house_number || ''} ${addr.road || addr.street || addr.residential || ''}`.trim() || result.display_name.split(',')[0],
            landmark: addr.suburb || addr.neighbourhood || addr.hamlet || addr.building || addr.amenity || '',
            city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
            state: addr.state || addr.region || '',
            pincode: addr.postcode || '',
        };

        console.log('Selected address:', addressData);
        onLocationSelect(addressData);
        toast.success('Address selected!');
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                setPosition([lat, lng]);

                // Pan map to current location
                if (mapRef.current) {
                    mapRef.current.setView([lat, lng], 16);
                }

                await reverseGeocode(lat, lng);
                setLoadingLocation(false);
                setLocationDenied(false); // Permission granted, hide button
            },
            (error) => {
                console.error('Geolocation error:', error);
                setLoadingLocation(false);

                if (error.code === error.PERMISSION_DENIED) {
                    toast.error('Location permission denied. Please enable location access.');
                    setLocationDenied(true); // Keep button visible
                } else {
                    toast.error('Failed to get your location');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Auto-detect current location on component mount
    useEffect(() => {
        // Only auto-detect if no initial location provided
        if (!initialLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    setPosition([lat, lng]);

                    // Pan map to current location
                    if (mapRef.current) {
                        mapRef.current.setView([lat, lng], 16);
                    }

                    await reverseGeocode(lat, lng);
                    setLocationDenied(false); // Permission granted
                },
                (error) => {
                    console.log('Auto-location detection skipped:', error.message);

                    // If permission denied, show the button
                    if (error.code === error.PERMISSION_DENIED) {
                        setLocationDenied(true);
                    }
                    // Silently fail - user can still search or click map
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );
        }
    }, []);

    return (
        <div className="space-y-4">
            {/* Search and Current Location */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        placeholder="Try: Area name, Street, Landmark (e.g., Andheri West, MG Road)"
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setShowResults(false);
                                setSearchResults([]);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* Live Search Results Dropdown (like Google Maps) */}
                    {showResults && (searchResults.length > 0 || searching) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-green-500 rounded-lg shadow-xl max-h-96 overflow-y-auto z-[9999]">
                            {searching && (
                                <div className="p-4 text-center">
                                    <Loader className="w-5 h-5 animate-spin text-green-600 mx-auto" />
                                    <p className="text-sm text-gray-600 mt-2">Searching...</p>
                                </div>
                            )}

                            {!searching && searchResults.length > 0 && (
                                <>
                                    <div className="p-2 bg-green-50 border-b border-green-200 sticky top-0">
                                        <p className="text-xs font-semibold text-green-700">
                                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>
                                    {searchResults.map((result, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleSelectResult(result)}
                                            className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition group"
                                        >
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition">
                                                        {result.display_name.split(',').slice(0, 2).join(', ')}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                        {result.display_name}
                                                    </p>
                                                    {result.type && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                            {result.type}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {/* No Results Message */}
                    {showResults && searchResults.length === 0 && !searching && searchQuery.length >= 3 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-orange-300 rounded-lg shadow-lg p-4 z-[9999]">
                            <p className="text-sm font-semibold text-gray-800 text-center mb-2">
                                No results found for "{searchQuery}"
                            </p>
                            <div className="text-xs text-gray-600 space-y-1">
                                <p className="font-semibold text-orange-700">💡 Try these instead:</p>
                                <p>• Search for <strong>area name</strong>: "Andheri West", "Bandra"</p>
                                <p>• Search for <strong>street name</strong>: "MG Road", "Linking Road"</p>
                                <p>• Search for <strong>landmark</strong>: "Railway Station", "Mall"</p>
                                <p className="mt-2 text-blue-700 font-semibold">
                                    Then click the map to mark your exact building! 📍
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Show "Use My Location" button only when searching */}
                {searchQuery && (
                    <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={loadingLocation}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {loadingLocation ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <Navigation className="w-5 h-5" />
                        )}
                        <span className="hidden sm:inline">Use My Location</span>
                        <span className="sm:hidden">GPS</span>
                    </button>
                )}
            </div>

            {/* Map */}
            <div className="relative rounded-lg overflow-hidden shadow-lg border-2 border-gray-200 h-96">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        onLocationChange={handleLocationChange}
                    />
                </MapContainer>

                {/* Instruction Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 z-[1000]">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="hidden sm:inline">Click map or drag marker to adjust location</span>
                        <span className="sm:hidden">Click or drag marker</span>
                    </p>
                </div>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-800 font-semibold mb-2">
                    📍 How to Add Your Address:
                </p>
                <div className="space-y-1 text-sm text-gray-700">
                    <p>
                        <strong>Auto-Location:</strong> Map automatically centers on your current location
                    </p>
                    <p>
                        <strong>Search:</strong> Type area/street name (e.g., "Andheri West", "MG Road")
                    </p>
                    <p>
                        <strong>Pinpoint:</strong> Click or drag the marker to your exact building
                    </p>
                    <p className="text-xs text-blue-700 mt-2 italic">
                        💡 Can't find your building? Search for the area, then click the map at your location!
                    </p>
                </div>
            </div>

            {/* Attribution */}
            <div className="text-xs text-gray-500 text-center">
                Powered by <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenStreetMap</a> - 100% Free & Open Source
            </div>
        </div>
    );
}
