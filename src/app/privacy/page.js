import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                <div className="space-y-2 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                        <Lock className="w-4 h-4" />
                        <span>Privacy Policy</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Privacy & Data Security Policy</h1>
                </div>

                <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
                    <p>
                        Your privacy is extremely important to FreshCart. This Privacy Policy details how we collect, store, encrypt, and protect your personal information.
                    </p>

                    <h2 className="text-lg font-bold text-gray-900">1. Information We Collect</h2>
                    <p>
                        We collect your name, email address, delivery addresses, phone number, and location coordinates solely for delivering your grocery orders efficiently.
                    </p>

                    <h2 className="text-lg font-bold text-gray-900">2. Payment Security</h2>
                    <p>
                        FreshCart does not store credit card details or sensitive bank passwords on our servers. All transactions are securely processed via encrypted PCI-DSS compliant payment gateways.
                    </p>

                    <h2 className="text-lg font-bold text-gray-900">3. Data Sharing</h2>
                    <p>
                        We do not sell, rent, or lease your personal information to third-party advertisers. Information is shared strictly with delivery partners to complete order delivery.
                    </p>
                </div>
            </div>
        </div>
    );
}
