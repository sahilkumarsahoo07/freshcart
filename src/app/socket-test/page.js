'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function SocketTestPage() {
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to Socket.io
        const newSocket = io({
            path: '/api/socket'
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to Socket.io!');
            setConnected(true);
            addMessage('Connected to Socket.io server');
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket.io');
            setConnected(false);
            addMessage('Disconnected from Socket.io server');
        });

        newSocket.on('order:new', (data) => {
            addMessage(`📦 New order received: ${JSON.stringify(data)}`);
        });

        newSocket.on('order:assigned', (data) => {
            addMessage(`✅ Order assigned: ${JSON.stringify(data)}`);
        });

        newSocket.on('order:confirmation_required', (data) => {
            addMessage(`⚠️ Confirmation required: ${JSON.stringify(data)}`);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    const addMessage = (msg) => {
        setMessages(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
    };

    const testEmit = () => {
        if (socket) {
            socket.emit('delivery:register', 'test-partner-123');
            addMessage('Sent: delivery:register');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Socket.io Connection Test</h1>

                {/* Connection Status */}
                <div className={`p-4 rounded-lg mb-6 ${connected ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="font-bold text-lg">
                            {connected ? '✅ Connected to Socket.io' : '❌ Not Connected'}
                        </span>
                    </div>
                    {connected && (
                        <p className="text-sm text-gray-700 mt-2">
                            WebSocket connection established at ws://localhost:3000
                        </p>
                    )}
                </div>

                {/* Test Button */}
                <button
                    onClick={testEmit}
                    disabled={!connected}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                    Test Emit Event
                </button>

                {/* Messages Log */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Event Log</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {messages.length === 0 ? (
                            <p className="text-gray-500 italic">No messages yet...</p>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                                    <span className="text-xs text-gray-500">{m.time}</span>
                                    <p className="text-sm font-mono">{m.msg}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-2">📋 How to Test:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Check if "Connected to Socket.io" shows above</li>
                        <li>Click "Test Emit Event" to send a test message</li>
                        <li>Open browser console (F12) to see Socket.io logs</li>
                        <li>Place an order with low stock to trigger real notifications</li>
                        <li>Login as delivery partner in another tab to see order notifications</li>
                    </ol>
                </div>

                {/* Server Info */}
                <div className="mt-6 bg-gray-100 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Server Information:</h3>
                    <ul className="text-sm space-y-1">
                        <li>• Server: http://localhost:3000</li>
                        <li>• WebSocket: ws://localhost:3000</li>
                        <li>• Socket.io Path: /api/socket</li>
                        <li>• Status: {connected ? 'Running ✅' : 'Not Connected ❌'}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
