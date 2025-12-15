'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, Package, DollarSign, Tag, Star } from 'lucide-react';

export default function ProductViewPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();
            setProduct(data.product);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product:', error);
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            toast.success('Product deleted successfully!');
            router.push('/admin/products');
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-gray-600">Product Details</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push(`/admin/products/${id}/edit`)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Edit className="w-5 h-5" />
                        Edit Product
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Images Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Product Images</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {product.images?.map((image, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                    src={image}
                                    alt={`${product.name} - Image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                                        Primary
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Name</label>
                                <p className="text-lg text-gray-900">{product.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Description</label>
                                <p className="text-gray-900">{product.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Category</label>
                                    <p className="text-gray-900">{product.category?.icon} {product.category?.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Brand</label>
                                    <p className="text-gray-900">{product.brand || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Pricing
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Regular Price</label>
                                <p className="text-2xl font-bold text-gray-900">₹{product.price}</p>
                            </div>
                            {product.discountPrice && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Discount Price</label>
                                    <p className="text-2xl font-bold text-green-600">₹{product.discountPrice}</p>
                                </div>
                            )}
                        </div>
                        {product.discountPrice && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <p className="text-green-700 font-semibold">
                                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Inventory */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Inventory
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Stock</label>
                                <p className={`text-2xl font-bold ${product.stock > 50 ? 'text-green-600' :
                                    product.stock > 10 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                    {product.stock} units
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Unit</label>
                                <p className="text-lg text-gray-900">{product.unitValue} {product.unit}</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5" />
                            Additional Information
                        </h2>
                        <div className="space-y-3">
                            {product.featured && (
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    <span className="font-semibold text-gray-900">Featured Product</span>
                                </div>
                            )}
                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-2">Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Created</label>
                                <p className="text-gray-900">{new Date(product.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Last Updated</label>
                                <p className="text-gray-900">{new Date(product.updatedAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
