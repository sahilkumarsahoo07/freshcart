'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Star, X, Loader, Home, Briefcase, MapPinned, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddressManager() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        label: 'HOME',
        street: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

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
            } else {
                toast.error('Failed to fetch addresses');
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openAddModal = () => {
        setEditingAddress(null);
        setFormData({
            label: 'HOME',
            street: '',
            landmark: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false,
        });
        setShowModal(true);
    };

    const openEditModal = (address) => {
        setEditingAddress(address);
        setFormData({
            label: address.label,
            street: address.street,
            landmark: address.landmark || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: address.isDefault,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                toast.success(editingAddress ? 'Address updated!' : 'Address added!');
                fetchAddresses();
                setShowModal(false);
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

    const handleDelete = async (addressId) => {
        try {
            const res = await fetch(`/api/user/addresses/${addressId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Address deleted!');
                fetchAddresses();
                setDeleteConfirm(null);
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
            const res = await fetch(`/api/user/addresses/${addressId}/set-default`, {
                method: 'PUT',
            });

            if (res.ok) {
                toast.success('Default address updated!');
                fetchAddresses();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to set default address');
            }
        } catch (error) {
            console.error('Error setting default address:', error);
            toast.error('Failed to set default address');
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-green-600" />
                    Saved Addresses
                </h2>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                    <Plus className="w-5 h-5" />
                    Add Address
                </button>
            </div>

            {/* Addresses Grid */}
            {addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No saved addresses yet</p>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add Your First Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div
                            key={address._id}
                            className="relative bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-green-300 transition-all group"
                        >
                            {/* Label and Default Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">
                                        {getLabelIcon(address.label)}
                                        {address.label}
                                    </span>
                                    {address.isDefault && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                            <Star className="w-3 h-3 fill-yellow-500" />
                                            Default
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Address Details */}
                            <div className="mb-4">
                                <p className="text-gray-900 font-medium mb-1">
                                    {address.street}
                                </p>
                                {address.landmark && (
                                    <p className="text-sm text-gray-600 mb-1">
                                        Near {address.landmark}
                                    </p>
                                )}
                                <p className="text-sm text-gray-600">
                                    {address.city}, {address.state} - {address.pincode}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address._id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                    >
                                        <Star className="w-3 h-3" />
                                        Set Default
                                    </button>
                                )}
                                <button
                                    onClick={() => openEditModal(address)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(address._id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                </button>
                            </div>

                            {/* Delete Confirmation */}
                            {deleteConfirm === address._id && (
                                <div className="absolute inset-0 bg-white bg-opacity-95 rounded-xl flex items-center justify-center p-4">
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-900 mb-3">
                                            Delete this address?
                                        </p>
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleDelete(address._id)}
                                                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
                                            >
                                                Yes, Delete
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Label Selection */}
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
                                            className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${formData.label === label
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="400001"
                                />
                            </div>

                            {/* Set as Default */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    name="isDefault"
                                    checked={formData.isDefault}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-green-600 rounded"
                                />
                                <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                                    Set as default address
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        {editingAddress ? 'Update Address' : 'Save Address'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
