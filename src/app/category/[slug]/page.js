'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft,
    Filter,
    ArrowUpDown,
    ShoppingBag,
    Sparkles,
    Tag,
    Flame,
    Zap,
    ChevronRight
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductQuickView from '@/components/products/ProductQuickView';
import FloatingCartBar from '@/components/cart/FloatingCartBar';

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const { slug } = params;

    const [category, setCategory] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('popular');
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Default Fallback Products for rich experience
    const fallbackProducts = [
        { _id: 'fv1', name: 'Fresh Farm Tomatoes', price: 39, originalPrice: 50, weight: '500g', category: { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' }, rating: 4.8, isFeatured: true, stock: 45, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80' },
        { _id: 'fv2', name: 'Fresh Red Apples', price: 149, originalPrice: 180, weight: '1 kg', category: { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' }, rating: 4.9, isFeatured: true, stock: 30, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80' },
        { _id: 'fv3', name: 'Organic Baby Spinach', price: 40, originalPrice: 50, weight: '250g', category: { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' }, rating: 4.7, isFeatured: true, stock: 35, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80' },
        { _id: 'fv4', name: 'Fresh Cavendish Bananas', price: 55, originalPrice: 70, weight: '1 Dozen', category: { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' }, rating: 4.8, isFeatured: true, stock: 60, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80' },
        { _id: 'fv5', name: 'Farm Fresh Potatoes', price: 35, originalPrice: 45, weight: '1 kg', category: { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' }, rating: 4.6, isFeatured: true, stock: 50, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80' },
        { _id: 'fv6', name: 'Fresh Red Onions', price: 45, originalPrice: 60, weight: '1 kg', category: { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' }, rating: 4.7, isFeatured: true, stock: 40, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80' },
        { _id: 'fv7', name: 'Green English Cucumbers', price: 29, originalPrice: 40, weight: '500g', category: { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' }, rating: 4.5, isFeatured: true, stock: 30, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&q=80' },
        { _id: 'fv8', name: 'Juicy Orange Valencia', price: 89, originalPrice: 110, weight: '1 kg', category: { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' }, rating: 4.9, isFeatured: true, stock: 25, image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&q=80' },
        { _id: 'da1', name: 'Pure Country Milk', price: 62, originalPrice: 70, weight: '1 L', category: { name: 'Dairy & Eggs', slug: 'dairy' }, rating: 4.8, isFeatured: true, stock: 50, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
        { _id: 'bk1', name: 'Whole Wheat Bread', price: 45, originalPrice: 55, weight: '400g', category: { name: 'Bakery', slug: 'bakery' }, rating: 4.6, isFeatured: true, stock: 30, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' }
    ];

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                setLoading(true);
                const [catRes, prodRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/products?limit=100')
                ]);

                const catData = await catRes.json();
                const prodData = await prodRes.json();

                if (catData.categories) {
                    setAllCategories(catData.categories);
                    const currentCat = catData.categories.find(
                        c => c.slug === slug || c._id === slug || c.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug
                    );
                    if (currentCat) {
                        setCategory(currentCat);
                    }
                }

                let allProds = prodData.products && prodData.products.length > 0
                    ? prodData.products
                    : fallbackProducts;

                // Filter products for current category slug
                const filtered = allProds.filter(p => {
                    if (!slug || slug === 'all') return true;
                    const catSlug = p.category?.slug || '';
                    const catName = p.category?.name?.toLowerCase() || '';

                    if (slug === 'fruits-vegetables' || slug === 'fresh-produce') {
                        return catSlug.includes('fruit') || catSlug.includes('veg') || catName.includes('fruit') || catName.includes('veg') || p._id.startsWith('fv');
                    }

                    return catSlug === slug || catName.includes(slug.replace(/-/g, ' '));
                });

                setProducts(filtered.length > 0 ? filtered : allProds);
            } catch (err) {
                console.error('Failed to load category products:', err);
                setProducts(fallbackProducts);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchCategoryData();
        }
    }, [slug]);

    // Sorting logic
    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0; // Popular / Default
    });

    const categoryTitle = category?.name || slug.replace(/-/g, ' ').toUpperCase();
    const categoryIcon = category?.icon || (slug.includes('veg') || slug.includes('fruit') ? '🥦' : '🛍️');

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 pb-16 space-y-6">
                {/* Breadcrumb & Navigation */}
                <div className="bg-white border-b border-gray-100 py-3">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
                            <span>/</span>
                            <Link href="/category" className="hover:text-emerald-600 transition">Categories</Link>
                            <span>/</span>
                            <span className="text-gray-900 capitalize font-bold">{categoryTitle}</span>
                        </div>
                    </div>
                </div>

                {/* Banner Section */}
                <section className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-green-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold text-emerald-200">
                                    <Zap className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                                    <span>Direct Dark Store Pickup & Express 10-Min Delivery</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-4xl md:text-5xl">{categoryIcon}</span>
                                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white capitalize">
                                        {categoryTitle}
                                    </h1>
                                </div>

                                <p className="text-emerald-100 text-xs md:text-sm max-w-xl">
                                    Farm-plucked fresh fruits, crispy greens, & premium organic grocery items packed with care.
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center self-start md:self-auto min-w-[140px]">
                                <p className="text-2xl font-black text-white">{sortedProducts.length}</p>
                                <p className="text-xs text-emerald-200 font-medium">Available Products</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories Strip */}
                {allCategories.length > 0 && (
                    <section className="container mx-auto px-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                            <Link
                                href="/category/fruits-vegetables"
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                                    slug === 'fruits-vegetables' || slug === 'vegetables' || slug === 'fruits'
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                                }`}
                            >
                                🥦 Fruits & Vegetables
                            </Link>
                            {allCategories.map((cat) => (
                                <Link
                                    key={cat._id}
                                    href={`/category/${cat.slug || cat._id}`}
                                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                                        slug === cat.slug || slug === cat._id
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                                    }`}
                                >
                                    {cat.icon || '🛍️'} {cat.name}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Controls Strip (Sort & Filter) */}
                <section className="container mx-auto px-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">Showing</span>
                            <span className="text-xs font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                                {sortedProducts.length} Products
                            </span>
                        </div>

                        {/* Sort selector */}
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-bold text-gray-700 hidden sm:inline">Sort By:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            >
                                <option value="popular">Popularity</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Products Grid */}
                <section className="container mx-auto px-4">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 animate-pulse space-y-3">
                                    <div className="w-full aspect-square bg-gray-200 rounded-xl"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : sortedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                            {sortedProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onQuickView={(p) => setQuickViewProduct(p)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto space-y-4">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                            <h3 className="text-lg font-bold text-gray-900">No products available yet</h3>
                            <p className="text-xs text-gray-500">Check back soon or explore other fresh categories</p>
                            <Link
                                href="/products"
                                className="inline-block px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
                            >
                                Browse All Products
                            </Link>
                        </div>
                    )}
                </section>
            </main>

            <Footer />

            {/* Floating Cart Bar */}
            <FloatingCartBar />

            {/* Quick View Modal */}
            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                />
            )}
        </div>
    );
}
