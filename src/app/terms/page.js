import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                <div className="space-y-2 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Legal</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Terms of Service</h1>
                </div>

                <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
                    <p>
                        Welcome to FreshCart. By using our website, mobile platform, or ordering products through our express delivery service, you agree to comply with and be bound by the following terms and conditions.
                    </p>

                    <h2 className="text-lg font-bold text-gray-900">1. Account Registration</h2>
                    <p>
                        Users must provide accurate email address, contact number, and address information. OTP verification is required to authorize purchases and secure customer accounts.
                    </p>

                    <h2 className="text-lg font-bold text-gray-900">2. Pricing & Availability</h2>
                    <p>
                        Product prices listed include applicable taxes. Prices and product availability may be updated in real time based on dark store inventory levels.
                    </p>

                    <h2 className="text-lg font-bold text-gray-900">3. User Conduct</h2>
                    <p>
                        Users agree not to misuse promotional coupons, engage in fraudulent transactions, or harass delivery partners and customer support personnel.
                    </p>
                </div>
            </div>
        </div>
    );
}
