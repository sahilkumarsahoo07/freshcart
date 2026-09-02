import Link from 'next/link';
import { RotateCcw, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                <div className="space-y-2 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                        <RotateCcw className="w-4 h-4" />
                        <span>Returns & Refund Policy</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">100% No-Questions-Asked Refund Guarantee</h1>
                </div>

                <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
                    <section className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-900">1. Instant On-Spot Returns</h2>
                        <p>
                            If you inspect your delivery upon arrival and find any damaged item, wrong product, or quality discrepancy, you can return it directly to the delivery rider for instant credit back to your FreshCart Wallet or original payment method.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-900">2. Refund Timeline</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>FreshCart Wallet Refund: <strong>Instant (Within 1 minute)</strong></li>
                            <li>UPI / Bank Account Refund: 1 to 3 business days</li>
                            <li>Credit / Debit Card Refund: 3 to 5 business days</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-900">3. Non-Returnable Items</h2>
                        <p>
                            For health and safety compliance, open food products, hygiene essentials, and items requested for return past 48 hours of delivery cannot be accepted unless defective upon arrival.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
