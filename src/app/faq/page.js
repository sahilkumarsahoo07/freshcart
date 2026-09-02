'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState(null);
    const [search, setSearch] = useState('');

    const faqs = [
        {
            q: 'How does FreshCart deliver groceries in 10 minutes?',
            a: 'FreshCart operates hyper-local micro-fulfillment centers (dark stores) in every neighborhood. When you place an order, items are picked and packed in under 2 minutes, and our dedicated delivery riders reach your door within 8-10 minutes.',
            cat: 'Delivery'
        },
        {
            q: 'What are the delivery charges?',
            a: 'Delivery is FREE on orders above ₹199. For orders below ₹199, a nominal delivery fee of ₹15 applies.',
            cat: 'Delivery'
        },
        {
            q: 'What if an item in my order is damaged or missing?',
            a: 'We offer a 100% No-Questions-Asked refund policy. Simply go to My Orders, select the order, and click "Report Issue" or chat with support to receive an instant refund to your wallet or original payment method.',
            cat: 'Refunds'
        },
        {
            q: 'How do I track my active order?',
            a: 'Once your order is confirmed, go to Customer Dashboard or My Orders to see real-time updates and live rider GPS location on the interactive map.',
            cat: 'Orders'
        },
        {
            q: 'What payment methods are supported?',
            a: 'We accept Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and FreshCart Wallet balance.',
            cat: 'Payment'
        },
        {
            q: 'Are your fruits and vegetables organic?',
            a: 'Yes! All fresh produce labeled "Organic" is sourced directly from certified organic farms and checked for quality standard parameters daily.',
            cat: 'Quality'
        }
    ];

    const filtered = faqs.filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xs text-gray-500">Everything you need to know about FreshCart express delivery and quality guarantee</p>

                    {/* Search */}
                    <div className="max-w-md mx-auto pt-2">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search questions..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-3">
                    {filtered.map((item, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition">
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-gray-900 text-sm hover:text-emerald-600 transition"
                                >
                                    <span>{item.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                                </button>

                                {isOpen && (
                                    <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Still Have Questions? */}
                <div className="bg-emerald-900 text-white rounded-2xl p-6 text-center space-y-3">
                    <h3 className="font-bold text-lg">Still have questions?</h3>
                    <p className="text-xs text-emerald-200">Our customer support team is available 24/7 to assist you.</p>
                    <Link
                        href="/contact"
                        className="inline-block bg-white text-emerald-900 font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-emerald-50 transition shadow"
                    >
                        Contact Customer Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
