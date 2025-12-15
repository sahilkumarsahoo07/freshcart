'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function TestNotificationPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const sendTestNotification = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/test-notification', {
                method: 'POST'
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Test notification sent!');
                setResult(data);
            } else {
                toast.error(data.error || 'Failed to send notification');
                setResult(data);
            }
        } catch (error) {
            toast.error('Error sending notification');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!session || session.user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600 font-bold">Admin access required</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Test Socket.io Notifications</h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Instructions:</h2>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Open 2 browser windows and login as delivery partners</li>
                        <li>Navigate both to <code className="bg-gray-100 px-2 py-1 rounded">/delivery</code></li>
                        <li>Open browser console (F12) in both windows</li>
                        <li>Click the button below to send test notification</li>
                        <li>Both delivery partners should see a popup notification</li>
                    </ol>
                </div>

                <button
                    onClick={sendTestNotification}
                    disabled={loading}
                    className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Sending...' : '📢 Send Test Notification to All Delivery Partners'}
                </button>

                {result && (
                    <div className={`mt-6 p-6 rounded-lg ${result.success ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
                        <h3 className="font-bold text-lg mb-2">
                            {result.success ? '✅ Success!' : '❌ Error'}
                        </h3>
                        <pre className="text-sm bg-white p-4 rounded overflow-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold mb-2">What to Check:</h3>
                    <ul className="text-sm space-y-1">
                        <li>• Server console: "📢 Broadcasting order to ALL delivery partners"</li>
                        <li>• Delivery partner console: "🔔 NEW ORDER RECEIVED"</li>
                        <li>• Delivery partner UI: Green popup at top-right</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
