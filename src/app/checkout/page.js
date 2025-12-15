'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AddressSelector from '@/components/checkout/AddressSelector';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, ShoppingBag, ArrowLeft, Loader, DoorOpen, ShieldCheck, PhoneOff, Bell, Clock } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { items, getTotal, getCount, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedInstructions, setSelectedInstructions] = useState([]);
    const [formData, setFormData] = useState({
        instructions: '',
        paymentMethod: 'COD',
    });

    const subtotal = getTotal();
    const deliveryFee = 40;
    const total = subtotal + deliveryFee;

    // Delivery instruction presets
    const deliveryInstructionPresets = [
        { id: 'leave-at-door', label: 'Leave at door', icon: DoorOpen },
        { id: 'leave-with-guard', label: 'Leave with guard', icon: ShieldCheck },
        { id: 'avoid-calling', label: 'Avoid calling', icon: PhoneOff },
        { id: 'ring-bell', label: 'Ring the bell', icon: Bell },
        { id: 'call-on-arrival', label: 'Call on arrival', icon: Clock },
    ];

    useEffect(() => {
        // Redirect to login if not authenticated
        if (status === 'unauthenticated') {
            router.push('/login?redirect=/checkout');
        }

        // Redirect to cart if cart is empty
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [status, items.length, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleInstructionPreset = (presetId) => {
        setSelectedInstructions(prev => {
            if (prev.includes(presetId)) {
                return prev.filter(id => id !== presetId);
            } else {
                return [...prev, presetId];
            }
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Validate that an address is selected
        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }

        setLoading(true);

        try {
            // Combine selected presets with custom instructions
            const presetLabels = selectedInstructions.map(id => {
                const preset = deliveryInstructionPresets.find(p => p.id === id);
                return preset ? preset.label : '';
            }).filter(Boolean);

            const combinedInstructions = [
                ...presetLabels,
                formData.instructions
            ].filter(Boolean).join('; ');

            // Prepare order data
            const orderData = {
                items: items.map(item => ({
                    product: item.product._id,
                    name: item.product.name,
                    price: item.product.discountPrice || item.product.price,
                    quantity: item.quantity,
                    image: item.product.images?.[0],
                })),
                deliveryAddress: {
                    fullName: selectedAddress.fullName,
                    phone: selectedAddress.phone,
                    addressLine1: selectedAddress.street,
                    addressLine2: selectedAddress.landmark || '',
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.pincode,
                    instructions: combinedInstructions,
                },
                paymentMethod: formData.paymentMethod,
                totalAmount: subtotal,
                deliveryFee,
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to place order');
            }

            // Clear cart and redirect to products page with order tracking
            clearCart();
            toast.success('Order placed successfully!');
            router.push(`/products?orderId=${data.order._id}`);
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error(error.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (items.length === 0) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Cart
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                <form onSubmit={handlePlaceOrder}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Delivery Address */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                                </div>

                                <AddressSelector
                                    onAddressSelect={setSelectedAddress}
                                    selectedAddressId={selectedAddress?._id}
                                />

                                {/* Delivery Instructions */}
                                {selectedAddress && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Delivery Instructions (Optional)
                                        </label>

                                        {/* Preset Buttons */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                            {deliveryInstructionPresets.map((preset) => {
                                                const Icon = preset.icon;
                                                const isSelected = selectedInstructions.includes(preset.id);
                                                return (
                                                    <button
                                                        key={preset.id}
                                                        type="button"
                                                        onClick={() => toggleInstructionPreset(preset.id)}
                                                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${isSelected
                                                            ? 'border-green-500 bg-green-50 text-green-700'
                                                            : 'border-gray-200 hover:border-green-300 bg-white text-gray-700'
                                                            }`}
                                                    >
                                                        <Icon className={`w-6 h-6 ${isSelected ? 'text-green-600' : 'text-gray-600'}`} />
                                                        <span className="text-xs font-semibold text-center">{preset.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Custom Instructions */}
                                        <textarea
                                            name="instructions"
                                            value={formData.instructions}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Add any other specific instructions..."
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-4 border-2 border-green-500 bg-green-50 rounded-lg cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={formData.paymentMethod === 'COD'}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-green-600"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">Cash on Delivery</p>
                                            <p className="text-sm text-gray-600">Pay when you receive your order</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-not-allowed opacity-50">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="ONLINE"
                                            disabled
                                            className="w-5 h-5"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">Online Payment</p>
                                            <p className="text-sm text-gray-600">Coming soon</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                                {/* Items */}
                                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={item.product._id} className="flex gap-3">
                                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                <Image
                                                    src={item.product.images?.[0] || '/placeholder-product.jpg'}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm text-gray-900">{item.product.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                <p className="text-sm font-bold text-green-600">
                                                    ₹{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal ({getCount()} items)</span>
                                        <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Delivery Fee</span>
                                        <span className="font-semibold">₹{deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between text-lg font-bold text-gray-900">
                                            <span>Total</span>
                                            <span className="text-green-600">₹{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Place Order Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Placing Order...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="w-5 h-5" />
                                            Place Order
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}
