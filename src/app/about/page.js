'use client';

import Link from 'next/link';
import { Zap, ShieldCheck, Heart, Users, Truck, Leaf, ChevronRight, Award } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl space-y-12">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                        <Leaf className="w-4 h-4" />
                        <span>About FreshCart</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Revolutionizing Grocery Delivery with 10-Minute Express Speed
                    </h1>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                        At FreshCart, we believe fresh, wholesome groceries should be available at your doorstep whenever you need them. No long waiting hours, no compromised freshness.
                    </p>
                </div>

                {/* Hero Feature Banner */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 md:p-12 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="space-y-2">
                        <p className="text-4xl md:text-5xl font-black text-emerald-300">10 Mins</p>
                        <p className="text-xs text-emerald-100 uppercase tracking-widest font-bold">Average Delivery Time</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-4xl md:text-5xl font-black text-emerald-300">100%</p>
                        <p className="text-xs text-emerald-100 uppercase tracking-widest font-bold">Organic & Farm Fresh</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-4xl md:text-5xl font-black text-emerald-300">50,000+</p>
                        <p className="text-xs text-emerald-100 uppercase tracking-widest font-bold">Happy Customers</p>
                    </div>
                </div>

                {/* Our Core Values */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-gray-900 text-center">Our Core Commitments</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Hyper-Local Dark Stores</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                We operate neighborhood micro-fulfillment centers located within 2km of your location to fulfill orders in under 10 minutes.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Leaf className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Farm Sourced Freshness</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                We partner directly with certified organic farmers, bypassing middlemen so you get fruits and vegetables picked hours ago.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Award className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Zero Plastic Goal</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                We package your groceries using 100% biodegradable eco-bags and transport them via electric delivery vehicles.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-4">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl transition shadow-lg"
                    >
                        <span>Start Shopping Fresh</span>
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
