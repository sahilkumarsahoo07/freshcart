'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
    const subtotal = item.price * item.quantity;
    const discount = item.discountPrice ? (item.price - item.discountPrice) * item.quantity : 0;
    const finalPrice = item.discountPrice || item.price;

    return (
        <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
            {/* Product Image */}
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                    src={item.image || '/placeholder-product.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Product Details */}
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                    {item.unitValue} {item.unit}
                </p>

                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                        ₹{finalPrice}
                    </span>
                    {item.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">
                            ₹{item.price}
                        </span>
                    )}
                </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end justify-between">
                <button
                    onClick={() => onRemove(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Remove item"
                >
                    <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded transition"
                        disabled={item.quantity <= 1}
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded transition"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="text-right">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="text-lg font-bold text-gray-900">
                        ₹{(finalPrice * item.quantity).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}
