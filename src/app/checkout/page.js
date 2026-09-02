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
import { Plus, Minus, Trash2, MapPin, CreditCard, ArrowLeft, Loader, DoorOpen, ShieldCheck, PhoneOff, Bell, Clock, Zap, Tag, CheckCircle2, Flame, Sparkles } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isMounted, setIsMounted] = useState(false);

    const { items, getTotal, getCount, clearCart, appliedCoupon, getDiscount, AVAILABLE_COUPONS, applyCoupon, removeCoupon, updateQuantity, removeItem } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedInstructions, setSelectedInstructions] = useState([]);
    const [couponInput, setCouponInput] = useState('');
    const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        instructions: '',
        paymentMethod: 'COD',
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        if (status === 'unauthenticated') {
            router.push('/login?redirect=/checkout');
        }
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [isMounted, status, items.length, router]);

    const subtotal = getTotal();
    const discount = getDiscount();
    const freeDeliveryThreshold = 299;
    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 40;
    const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

    const deliveryInstructionPresets = [
        { id: 'leave-at-door', label: 'Leave at door', icon: DoorOpen },
        { id: 'leave-with-guard', label: 'Leave with guard', icon: ShieldCheck },
        { id: 'avoid-calling', label: 'Avoid calling', icon: PhoneOff },
        { id: 'ring-bell', label: 'Ring the bell', icon: Bell },
        { id: 'call-on-arrival', label: 'Call on arrival', icon: Clock },
    ];

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

        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }

        setLoading(true);

        try {
            const presetLabels = selectedInstructions.map(id => {
                const preset = deliveryInstructionPresets.find(p => p.id === id);
                return preset ? preset.label : '';
            }).filter(Boolean);

            const combinedInstructions = [
                ...presetLabels,
                formData.instructions
            ].filter(Boolean).join('; ');

            const orderData = {
                items: items.map(item => ({
                    product: item.product._id,
                    name: item.product.name,
                    price: item.product.discountPrice || item.product.price,
                    quantity: item.quantity,
                    image: item.product.images?.[0] || item.product.image,
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

            clearCart();
            toast.success('🎉 Order placed successfully!');
            router.push(`/my-orders/${data.order._id}`);
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error(error.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader className="w-10 h-10 animate-spin text-emerald-700" />
            </div>
        );
    }

    if (items.length === 0) return null;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            <Navbar />

            {/* Instamart Next-Gen Hero Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white py-6 md:py-10 border-b border-emerald-800/40 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="container mx-auto px-4 max-w-6xl relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 text-[11px] font-black px-3 py-1 rounded-full border border-yellow-400/30">
                            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-pulse" />
                            <span>INSTAMART EXPRESS DISPATCH</span>
                            <span className="text-emerald-400 font-bold">• 10 MIN ETA</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Checkout</h1>
                        <p className="text-emerald-200/80 text-xs md:text-sm font-medium">
                            Select delivery address and payment method to complete order
                        </p>
                    </div>

                    {/* Step Breadcrumb Bar */}
                    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-xs font-black shadow-lg">
                        <Link href="/cart" className="text-emerald-400 flex items-center gap-2 hover:underline">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">✓</span>
                            Cart
                        </Link>
                        <span className="text-gray-600">→</span>
                        <span className="text-emerald-300 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                            Delivery & Payment
                        </span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <form onSubmit={handlePlaceOrder}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Address & Instructions Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900">1. Delivery Address</h2>
                                        <p className="text-xs text-gray-500 font-semibold">Select where you want your order delivered</p>
                                    </div>
                                </div>

                                <AddressSelector
                                    onAddressSelect={setSelectedAddress}
                                    selectedAddressId={selectedAddress?._id}
                                />

                                {selectedAddress && (
                                    <div className="pt-6 border-t border-gray-100 space-y-3">
                                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                                            Delivery Instructions (Optional)
                                        </label>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {deliveryInstructionPresets.map((preset) => {
                                                const Icon = preset.icon;
                                                const isSelected = selectedInstructions.includes(preset.id);
                                                return (
                                                    <button
                                                        key={preset.id}
                                                        type="button"
                                                        onClick={() => toggleInstructionPreset(preset.id)}
                                                        className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition ${
                                                            isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-black' : 'border-gray-200 bg-white text-gray-700 font-medium'
                                                        }`}
                                                    >
                                                        <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-700' : 'text-gray-400'}`} />
                                                        <span className="text-xs">{preset.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <textarea
                                            name="instructions"
                                            value={formData.instructions}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="Add specific instructions for delivery agent..."
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900">2. Payment Method</h2>
                                        <p className="text-xs text-gray-500 font-semibold">Cash or UPI upon delivery</p>
                                    </div>
                                </div>

                                <label className="flex items-center justify-between p-4 border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl cursor-pointer shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} className="w-5 h-5 text-emerald-700" />
                                        <div>
                                            <p className="font-black text-sm text-gray-900">Cash on Delivery (COD / UPI)</p>
                                            <p className="text-xs text-gray-500 font-medium">Pay cash or scan QR when driver arrives</p>
                                        </div>
                                    </div>
                                    <span className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full">INSTANT COD</span>
                                </label>
                            </div>
                        </div>

                        {/* Summary Right Sidebar */}
                        <div className="lg:col-span-1 sticky top-20">
                            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xl space-y-6">
                                <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Order Basket ({getCount()})</h2>

                                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                    {items.map((item) => (
                                        <div key={item.product._id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-2xl p-2.5 border border-gray-200/70">
                                            <div className="relative w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden bg-white p-1 border border-gray-200">
                                                <Image src={item.product.images?.[0] || item.product.image || '/placeholder-product.jpg'} alt={item.product.name} fill className="object-cover rounded-lg" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-xs text-gray-900 truncate">{item.product.name}</p>
                                                <p className="text-xs font-black text-emerald-700">₹{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(0)}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-0.5 shadow-sm">
                                                    <button type="button" onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-4 text-center text-xs font-black text-gray-900">{item.quantity}</span>
                                                    <button type="button" onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <button type="button" onClick={() => removeItem(item.product._id)} className="text-gray-400 hover:text-rose-600 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 text-xs font-semibold border-t border-gray-100 pt-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({getCount()})</span>
                                        <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-emerald-700 font-black bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                                            <span>Discount ({appliedCoupon.code})</span>
                                            <span>- ₹{discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Fee</span>
                                        <span>{deliveryFee === 0 ? <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded">FREE</span> : `₹${deliveryFee.toFixed(2)}`}</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                                        <span className="text-sm font-black text-gray-900">Total Payable</span>
                                        <span className="text-2xl font-black text-emerald-700">₹{finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 hover:opacity-95 text-white rounded-2xl font-black text-sm transition shadow-xl flex items-center justify-center gap-2 disabled:bg-gray-400"
                                >
                                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span>Place 10-Min Order 🚀</span>}
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
