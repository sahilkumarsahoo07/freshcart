'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductQuickView from '@/components/products/ProductQuickView';
import FloatingCartBar from '@/components/cart/FloatingCartBar';
import OrderTrackingModal from '@/components/orders/OrderTrackingModal';
import Link from 'next/link';
import { ChevronRight, TrendingUp, Percent, Package } from 'lucide-react';

// Separate component for search params logic
function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Order tracking modal state
    const [trackingOrderId, setTrackingOrderId] = useState(null);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

    // Check for orderId in URL params
    useEffect(() => {
        const orderId = searchParams.get('orderId');
        console.log('🔍 Checking for orderId in URL:', orderId);
        if (orderId) {
            console.log('✅ Found orderId, opening modal:', orderId);
            setTrackingOrderId(orderId);
            setIsTrackingModalOpen(true);
        }
    }, [searchParams]);

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
    };

    const closeQuickView = () => {
        setIsQuickViewOpen(false);
        setTimeout(() => setSelectedProduct(null), 300);
    };

    const closeTrackingModal = () => {
        console.log('❌ Closing tracking modal');
        setIsTrackingModalOpen(false);
        setTrackingOrderId(null);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch categories
            const categoriesRes = await fetch('/api/categories');
            const categoriesData = await categoriesRes.json();
            setCategories(categoriesData.categories || []);

            // Fetch featured products (Today's Offers)
            const featuredRes = await fetch('/api/products?featured=true&limit=8');
            const featuredData = await featuredRes.json();
            setFeaturedProducts(featuredData.products || []);

            // Fetch all products
            const allRes = await fetch('/api/products?limit=12');
            const allData = await allRes.json();
            setAllProducts(allData.products || []);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
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
                {/* Hero Banner */}
                <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Fresh Products, Great Prices
                        </h1>
                        <p className="text-xl opacity-90">
                            Discover our wide range of fresh groceries delivered to your doorstep
                        </p>
                    </div>
                </section>

                {/* Categories Section */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
                            <Link
                                href="/categories"
                                className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
                            >
                                View All <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categories.map((category) => (
                                <Link
                                    key={category._id}
                                    href={`/category/${category.slug}`}
                                    className="group"
                                >
                                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-green-500">
                                        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                                            {category.icon}
                                        </div>
                                        <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {category.productCount} products
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Today's Offers Section */}
                <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                <Percent className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">Today's Special Offers</h2>
                                <p className="text-gray-600">Limited time deals - Grab them before they're gone!</p>
                            </div>
                        </div>

                        {featuredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredProducts.map((product) => (
                                    <ProductCard key={product._id} product={product} onQuickView={handleQuickView} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl">
                                <Percent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No special offers available right now</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Best Sellers Section */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">Best Sellers</h2>
                                <p className="text-gray-600">Most popular products this week</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {allProducts.slice(0, 8).map((product) => (
                                <ProductCard key={product._id} product={product} onQuickView={handleQuickView} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* All Products Section */}
                <section className="py-12 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">All Products</h2>
                                <p className="text-gray-600">Browse our complete collection</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {allProducts.map((product) => (
                                <ProductCard key={product._id} product={product} onQuickView={handleQuickView} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        <div className="text-center mt-12">
                            <button className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl">
                                Load More Products
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />

            {/* Product Quick View Modal */}
            <ProductQuickView
                product={selectedProduct}
                isOpen={isQuickViewOpen}
                onClose={closeQuickView}
            />

            {/* Floating Cart Bar */}
            <FloatingCartBar />

            {/* Order Tracking Modal */}
            <OrderTrackingModal
                orderId={trackingOrderId}
                isOpen={isTrackingModalOpen}
                onClose={closeTrackingModal}
            />
        </div>
    );
}

// Main component with Suspense boundary
export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
