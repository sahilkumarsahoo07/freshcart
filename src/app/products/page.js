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
import useProductStore from '@/store/useProductStore';

// Separate component for search params logic
function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { fetchCategories, fetchProducts } = useProductStore();
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);
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

    const fallbackProducts = [
        { _id: 'p1', name: 'Fresh Organic Farm Tomatoes', price: 39, originalPrice: 50, weight: '500g', category: { name: 'Fresh Vegetables', slug: 'vegetables' }, rating: { average: 4.8 }, isFeatured: true, stock: 45, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80' },
        { _id: 'p2', name: 'Fresh Red Shimla Apples', price: 149, originalPrice: 180, weight: '1 kg', category: { name: 'Fresh Fruits', slug: 'fruits' }, rating: { average: 4.9 }, isFeatured: true, stock: 30, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80' },
        { _id: 'p3', name: 'Pure Country Cow Milk', price: 62, originalPrice: 70, weight: '1 L', category: { name: 'Dairy & Eggs', slug: 'dairy' }, rating: { average: 4.8 }, isFeatured: true, stock: 50, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
        { _id: 'p4', name: 'Whole Wheat Artisan Bread', price: 45, originalPrice: 55, weight: '400g', category: { name: 'Bakery', slug: 'bakery' }, rating: { average: 4.6 }, isFeatured: true, stock: 30, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
        { _id: 'p5', name: 'Cold Pressed Orange Juice', price: 99, originalPrice: 120, weight: '500ml', category: { name: 'Beverages', slug: 'beverages' }, rating: { average: 4.8 }, isFeatured: true, stock: 20, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80' },
        { _id: 'p6', name: 'Roasted Salted Almonds', price: 299, originalPrice: 350, weight: '250g', category: { name: 'Snacks & Chips', slug: 'snacks' }, rating: { average: 4.9 }, isFeatured: true, stock: 40, image: 'https://images.unsplash.com/photo-1508061252966-17df56214578?w=400&q=80' },
        { _id: 'p7', name: 'Organic Baby Spinach', price: 40, originalPrice: 50, weight: '250g', category: { name: 'Fresh Vegetables', slug: 'vegetables' }, rating: { average: 4.7 }, isFeatured: true, stock: 35, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80' },
        { _id: 'p8', name: 'Fresh Cavendish Bananas', price: 55, originalPrice: 70, weight: '1 Dozen', category: { name: 'Fresh Fruits', slug: 'fruits' }, rating: { average: 4.8 }, isFeatured: true, stock: 60, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80' }
    ];

    useEffect(() => {
        const loadInstantProducts = async () => {
            const cachedCats = await fetchCategories();
            const cachedProds = await fetchProducts({ limit: 100 });
            if (cachedCats?.length) setCategories(cachedCats);
            const prodsToSet = cachedProds?.length ? cachedProds : fallbackProducts;
            setAllProducts(prodsToSet);
            setFeaturedProducts(prodsToSet.filter(p => p.isFeatured));
        };

        loadInstantProducts();
    }, []);

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
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
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

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
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

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
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
