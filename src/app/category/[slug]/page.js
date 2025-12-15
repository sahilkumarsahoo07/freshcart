'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { ChevronLeft, Filter } from 'lucide-react';

export default function CategoryPage() {
    const params = useParams();
    const { slug } = params;

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchCategoryProducts();
        }
    }, [slug]);

    const fetchCategoryProducts = async () => {
        try {
            // Fetch products for this category
            const res = await fetch(`/api/products?category=${slug}&limit=20`);
            const data = await res.json();
            setProducts(data.products || []);

            // Get category info from first product
            if (data.products && data.products.length > 0 && data.products[0].category) {
                setCategory(data.products[0].category);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching category products:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1">
                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/" className="text-gray-600 hover:text-green-600">
                                Home
                            </Link>
                            <span className="text-gray-400">/</span>
                            <Link href="/products" className="text-gray-600 hover:text-green-600">
                                Products
                            </Link>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-900 font-semibold">
                                {category?.name || slug}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Category Header */}
                <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
                    <div className="container mx-auto px-4">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back to All Products
                        </Link>

                        <div className="flex items-center gap-4">
                            {category?.icon && (
                                <div className="text-6xl">{category.icon}</div>
                            )}
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                    {category?.name || slug.replace(/-/g, ' ')}
                                </h1>
                                <p className="text-xl opacity-90">
                                    {category?.description || 'Browse our fresh selection'}
                                </p>
                                <p className="text-sm opacity-75 mt-2">
                                    {products.length} products available
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters Bar */}
                <div className="bg-white border-b sticky top-0 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-600">
                                Showing <span className="font-semibold">{products.length}</span> products
                            </p>
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-green-600 hover:text-green-600 transition">
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    We couldn't find any products in this category
                                </p>
                                <Link
                                    href="/products"
                                    className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                                >
                                    Browse All Products
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
