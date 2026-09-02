'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, SlidersHorizontal, ChevronRight, ShoppingBag, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCartBar from '@/components/cart/FloatingCartBar';
import ProductCard from '@/components/products/ProductCard';
import ProductQuickView from '@/components/products/ProductQuickView';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || 'all';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(query);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [priceRange, setPriceRange] = useState(1000);
    const [sortBy, setSortBy] = useState('relevance');
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    useEffect(() => {
        setSearchTerm(query);
    }, [query]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [prodRes, catRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories')
                ]);
                const prodData = await prodRes.json();
                const catData = await catRes.json();

                if (prodData.products) setProducts(prodData.products);
                if (catData.categories) setCategories(catData.categories);
            } catch (err) {
                console.error('Failed to fetch search data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}&category=${selectedCategory}`);
    };

    // Filter Logic
    let filtered = products.filter(p => {
        const matchesQuery = query
            ? p.name.toLowerCase().includes(query.toLowerCase()) ||
              p.description?.toLowerCase().includes(query.toLowerCase()) ||
              p.brand?.toLowerCase().includes(query.toLowerCase())
            : true;

        const matchesCat = selectedCategory === 'all'
            ? true
            : (typeof p.category === 'object'
                ? p.category?.slug === selectedCategory || p.category?._id === selectedCategory
                : p.category === selectedCategory);

        const finalPrice = p.discountPrice || p.price;
        const matchesPrice = finalPrice <= priceRange;

        return matchesQuery && matchesCat && matchesPrice;
    });

    // Sorting Logic
    if (sortBy === 'price-low') {
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === 'rating') {
        filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
                    {/* Header Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Link href="/" className="hover:text-emerald-600">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-900 font-semibold">Search Results</span>
                    </div>

                    {/* Top Search Bar */}
                    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-8">
                        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search products, brands, or categories..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-md"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Sidebar Filters */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <h3 className="font-extrabold text-gray-900 flex items-center gap-2 text-base">
                                        <Filter className="w-4 h-4 text-emerald-600" />
                                        Filters
                                    </h3>
                                    {(selectedCategory !== 'all' || priceRange < 1000) && (
                                        <button
                                            onClick={() => {
                                                setSelectedCategory('all');
                                                setPriceRange(1000);
                                            }}
                                            className="text-xs text-emerald-600 hover:underline font-bold"
                                        >
                                            Reset All
                                        </button>
                                    )}
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm mb-3">Categories</h4>
                                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                                selectedCategory === 'all'
                                                    ? 'bg-emerald-50 text-emerald-700 font-extrabold'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            All Categories
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat._id}
                                                onClick={() => setSelectedCategory(cat.slug || cat._id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                                                    selectedCategory === (cat.slug || cat._id)
                                                        ? 'bg-emerald-50 text-emerald-700 font-extrabold'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className="truncate">{cat.icon} {cat.name}</span>
                                                <span className="text-[10px] text-gray-400">({cat.productCount || 0})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Max Price Filter */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-gray-800 text-sm">Max Price</h4>
                                        <span className="text-xs font-extrabold text-emerald-600">₹{priceRange}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="1000"
                                        step="10"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(Number(e.target.value))}
                                        className="w-full accent-emerald-600 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                        <span>₹10</span>
                                        <span>₹1000+</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Results Grid */}
                        <div className="lg:col-span-9 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <p className="text-sm font-semibold text-gray-700">
                                    Showing <span className="text-emerald-600 font-extrabold">{filtered.length}</span> items
                                    {query && <span> for "<span className="text-gray-900 font-bold">{query}</span>"</span>}
                                </p>

                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs text-gray-500 font-medium">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="relevance">Relevance</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Highest Rated</option>
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse space-y-4">
                                            <div className="w-full aspect-square bg-gray-200 rounded-xl"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : filtered.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                                    {filtered.map((prod) => (
                                        <ProductCard
                                            key={prod._id}
                                            product={prod}
                                            onQuickView={(p) => setQuickViewProduct(p)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800">No matching products found</h3>
                                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                        We couldn't find any products matching your search criteria. Try adjusting filters or searching another keyword.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedCategory('all');
                                            setPriceRange(1000);
                                            router.push('/search');
                                        }}
                                        className="mt-6 px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
                                    >
                                        Clear Filters & Search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <FloatingCartBar />

            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                />
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-600 font-semibold">Loading search...</p>
                </div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
