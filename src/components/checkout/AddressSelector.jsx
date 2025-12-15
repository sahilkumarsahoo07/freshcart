'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Star, X, Loader, Home, Briefcase, MapPinned, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import AddressMap from './AddressMap';

export default function AddressSelector({ onAddressSelect, selectedAddressId }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        label: 'HOME',
        fullName: '',
        phone: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        latitude: null,
        longitude: null,
        formattedAddress: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/user/addresses');
            const data = await res.json();

            if (res.ok) {
                setAddresses(data.addresses || []);

                // Auto-select default address or first address
                if (data.addresses && data.addresses.length > 0 && !selectedAddressId) {
                    const defaultAddr = data.addresses.find(addr => addr.isDefault);
                    const addrToSelect = defaultAddr || data.addresses[0];
                    onAddressSelect(addrToSelect);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationSelect = (locationData) => {
        setFormData(prev => ({
            ...prev,
            ...locationData,
        }));
    };

    const handleAddAddress = async () => {
        // Validate required fields
        if (!formData.fullName || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.pincode) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Validate phone number
        if (formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        // Validate pincode
        if (formData.pincode.length !== 6 || !/^\d{6}$/.test(formData.pincode)) {
            toast.error('Please enter a valid 6-digit pincode');
            return;
        }

        setSubmitting(true);

        try {
            const url = editingAddress
                ? `/api/user/addresses/${editingAddress._id}`
                : '/api/user/addresses';

            const method = editingAddress ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');

                if (editingAddress) {
                    setAddresses(prev => prev.map(addr =>
                        addr._id === editingAddress._id ? data.address : addr
                    ));
                } else {
                    setAddresses(prev => [...prev, data.address]);
                }

                onAddressSelect(data.address);
                resetForm();
            } else {
                toast.error(data.error || 'Failed to save address');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setFormData({
            label: address.label,
            fullName: address.fullName || '',
            phone: address.phone || '',
            street: address.street,
            landmark: address.landmark || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            latitude: address.latitude,
            longitude: address.longitude,
            formattedAddress: address.formattedAddress || '',
        });
        setShowAddForm(true);
    };

    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            const res = await fetch(`/api/user/addresses/${addressId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Address deleted successfully!');
                setAddresses(prev => prev.filter(addr => addr._id !== addressId));

                // If deleted address was selected, select another one
                if (selectedAddressId === addressId && addresses.length > 1) {
                    const remainingAddresses = addresses.filter(addr => addr._id !== addressId);
                    onAddressSelect(remainingAddresses[0]);
                }
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to delete address');
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Failed to delete address');
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const res = await fetch(`/api/user/addresses/${addressId}/default`, {
                method: 'PATCH',
            });

            if (res.ok) {
                toast.success('Default address updated!');
                setAddresses(prev => prev.map(addr => ({
                    ...addr,
                    isDefault: addr._id === addressId,
                })));
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to set default address');
            }
        } catch (error) {
            console.error('Error setting default:', error);
            toast.error('Failed to set default address');
        }
    };

    const resetForm = () => {
        setShowAddForm(false);
        setEditingAddress(null);
        setFormData({
            label: 'HOME',
            fullName: '',
            phone: '',
            street: '',
            landmark: '',
            city: '',
            state: '',
            pincode: '',
            latitude: null,
            longitude: null,
            formattedAddress: '',
        });
    };

    const getLabelIcon = (label) => {
        switch (label) {
            case 'HOME':
                return <Home className="w-5 h-5" />;
            case 'WORK':
                return <Briefcase className="w-5 h-5" />;
            default:
                return <MapPinned className="w-5 h-5" />;
        }
    };

    const getLabelColor = (label) => {
        switch (label) {
            case 'HOME':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'WORK':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-purple-100 text-purple-700 border-purple-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Empty State */}
            {addresses.length === 0 && !showAddForm && (
                <div className="text-center py-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-dashed border-green-300">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Package className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Add Your First Address</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Save your delivery address for faster checkout and accurate deliveries
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        Add Delivery Address
                    </button>
                </div>
            )}

            {/* Saved Addresses */}
            {addresses.length > 0 && !showAddForm && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            Select Delivery Address
                        </h3>
                        <span className="text-sm text-gray-500">{addresses.length} saved</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {addresses.map((address) => (
                            <div
                                key={address._id}
                                className={`relative group p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddressId === address._id
                                    ? 'border-green-500 bg-green-50 shadow-md'
                                    : 'border-gray-200 hover:border-green-300 bg-white'
                                    }`}
                                onClick={() => onAddressSelect(address)}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Radio Button */}
                                    <input
                                        type="radio"
                                        name="selectedAddress"
                                        checked={selectedAddressId === address._id}
                                        onChange={() => onAddressSelect(address)}
                                        className="mt-1 w-5 h-5 text-green-600 cursor-pointer"
                                    />

                                    {/* Address Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Label and Badges */}
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-lg border ${getLabelColor(address.label)}`}>
                                                {getLabelIcon(address.label)}
                                                {address.label}
                                            </span>
                                            {address.isDefault && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-md border border-yellow-200">
                                                    <Star className="w-3 h-3 fill-yellow-500" />
                                                    Default
                                                </span>
                                            )}
                                        </div>

                                        {/* Contact Information */}
                                        {(address.fullName || address.phone) && (
                                            <div className="mb-2 pb-2 border-b border-gray-200">
                                                {address.fullName && (
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {address.fullName}
                                                    </p>
                                                )}
                                                {address.phone && (
                                                    <p className="text-sm text-gray-700">
                                                        📞 {address.phone}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Address Text */}
                                        <p className="text-sm font-semibold text-gray-900 mb-1">
                                            {address.street}
                                            {address.landmark && `, ${address.landmark}`}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {address.city}, {address.state} - {address.pincode}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!address.isDefault && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSetDefault(address._id);
                                                }}
                                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                                title="Set as default"
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditAddress(address);
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Edit address"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAddress(address._id);
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Delete address"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add New Button */}
                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Address
                    </button>
                </div>
            )}

            {/* Add/Edit Address Form */}
            {showAddForm && (
                <div className="border-2 border-green-500 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {editingAddress ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-white rounded-lg transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Google Maps */}
                        <AddressMap
                            onLocationSelect={handleLocationSelect}
                            initialLocation={
                                formData.latitude && formData.longitude
                                    ? { lat: formData.latitude, lng: formData.longitude }
                                    : null
                            }
                        />

                        {/* Editable Contact Information for this Address */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-3">
                                💡 Contact info is pre-filled from above. You can change it for this specific address if needed.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        maxLength={10}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        placeholder="10-digit number"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Type Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address Type
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['HOME', 'WORK', 'OTHER'].map((label) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, label }))}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${formData.label === label
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500'
                                            }`}
                                    >
                                        {getLabelIcon(label)}
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Street */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="House No., Building Name, Street"
                            />
                        </div>

                        {/* Landmark */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Landmark (Optional)
                            </label>
                            <input
                                type="text"
                                name="landmark"
                                value={formData.landmark}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Near..."
                            />
                        </div>

                        {/* City and State */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    State *
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="State"
                                />
                            </div>
                        </div>

                        {/* Pincode */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Pincode *
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                required
                                pattern="[0-9]{6}"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="400001"
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleAddAddress}
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                            >
                                {submitting ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        {editingAddress ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                        {editingAddress ? 'Update Address' : 'Save Address'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div >
            )
            }
        </div >
    );
}
