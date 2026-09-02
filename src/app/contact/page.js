'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        toast.success('Thank you! Your message has been sent to customer support.');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl space-y-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        We're Here to Help You!
                    </h1>
                    <p className="text-sm text-gray-500">
                        Have questions about your order, delivery speed, or product quality? Reach out to us anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Info Cards */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-emerald-600" />
                                Contact Information
                            </h2>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Headquarters</p>
                                        <p className="text-xs text-gray-500 mt-0.5">123 FreshCart Plaza, Market Street, Mumbai, Maharashtra 400001</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">24/7 Support Hotline</p>
                                        <p className="text-xs text-gray-500 mt-0.5">+91 (800) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Email Us</p>
                                        <p className="text-xs text-gray-500 mt-0.5">support@freshcart.com</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Delivery Hours</p>
                                        <p className="text-xs text-gray-500 mt-0.5">6:00 AM – 11:00 PM (Everyday)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            {submitted ? (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Message Received!</h2>
                                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                        Our support team will get back to your email within 15 minutes.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="mt-4 px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <h2 className="text-xl font-black text-gray-900">Send us a Message</h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Your Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Your Email *</label>
                                            <input
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="john@example.com"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                                        <input
                                            type="text"
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            placeholder="e.g. Order Tracking or Refund Inquiry"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Message *</label>
                                        <textarea
                                            rows="5"
                                            required
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            placeholder="Write details of your issue or feedback..."
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>Submit Inquiry</span>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
