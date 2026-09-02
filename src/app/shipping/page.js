import Link from 'next/link';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                <div className="space-y-2 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                        <Truck className="w-4 h-4" />
                        <span>Shipping Policy</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Express Shipping & Delivery Guidelines</h1>
                </div>

                <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
                    <section className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-900">1. 10-Minute Express Delivery Guarantee</h2>
                        <p>
                            FreshCart operates micro-dark stores strategically placed across major urban hubs. All orders placed within our delivery zones are dispatched immediately via dedicated delivery partners and delivered in 10-15 minutes under normal weather conditions.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-900">2. Delivery Charges</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Orders above ₹199: <strong>FREE Delivery</strong></li>
                            <li>Orders below ₹199: Nominal delivery fee of ₹15</li>
                            <li>Late night express fee (10 PM - 11 PM): ₹10</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-900">3. Live GPS Order Tracking</h2>
                        <p>
                            You can track the exact location of your assigned delivery partner on an interactive map in real-time from your Customer Dashboard or Order Details page.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-900">4. Zero Contact Delivery Option</h2>
                        <p>
                            During checkout, you can select "Leave at Doorstep" for contactless delivery. Our delivery partner will notify you via call/SMS upon dropping off your parcel.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
