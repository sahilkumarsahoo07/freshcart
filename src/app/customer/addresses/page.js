'use client';

import AddressManager from '@/components/customer/AddressManager';

export default function CustomerAddressesPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                <AddressManager />
            </div>
        </div>
    );
}
