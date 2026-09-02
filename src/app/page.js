'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Zap,
    ShieldCheck,
    Truck,
    Clock,
    Search,
    ArrowRight,
    Star,
    Sparkles,
    ShoppingBag,
    Tag,
    ChevronRight,
    Award,
    HeartHandshake,
    Utensils,
    Copy,
    Check,
    MapPin,
    BadgePercent,
    Flame
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductQuickView from '@/components/products/ProductQuickView';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCartBar from '@/components/cart/FloatingCartBar';
import useCartStore from '@/store/useCartStore';
import useProductStore from '@/store/useProductStore';
import toast from 'react-hot-toast';

export default function Home() {
    const router = useRouter();
    const addToCart = useCartStore((state) => state.addItem);
    const { fetchCategories, fetchProducts } = useProductStore();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [copiedCode, setCopiedCode] = useState('');
    const [selectedDiet, setSelectedDiet] = useState('all');

    useEffect(() => {
        const loadInstantData = async () => {
            // Load instantly from cache
            const cachedCats = await fetchCategories();
            const cachedProds = await fetchProducts({ limit: 100 });
            if (cachedCats?.length) setCategories(cachedCats);
            if (cachedProds?.length) setProducts(cachedProds);
        };

        loadInstantData();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const copyCouponCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Coupon ${code} copied! Use at checkout.`);
        setTimeout(() => setCopiedCode(''), 3000);
    };

    const displayCategories = categories.length > 0 ? categories : [
        { _id: '1', name: 'Fresh Vegetables', slug: 'vegetables', icon: '🥦', productCount: 24 },
        { _id: '2', name: 'Fresh Fruits', slug: 'fruits', icon: '🍎', productCount: 18 },
        { _id: '3', name: 'Dairy & Eggs', slug: 'dairy', icon: '🥛', productCount: 15 },
        { _id: '4', name: 'Bakery & Bread', slug: 'bakery', icon: '🍞', productCount: 12 },
        { _id: '5', name: 'Beverages', slug: 'beverages', icon: '🧃', productCount: 20 },
        { _id: '6', name: 'Snacks & Chips', slug: 'snacks', icon: '🍿', productCount: 30 }
    ];

    const fallbackProducts = [
        { _id: 'f1', name: 'Organic Farm Tomatoes', price: 39, originalPrice: 50, weight: '500g', category: { name: 'Fresh Vegetables', slug: 'vegetables' }, rating: 4.8, isFeatured: true, stock: 45, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80' },
        { _id: 'f2', name: 'Fresh Red Apples', price: 149, originalPrice: 180, weight: '1 kg', category: { name: 'Fresh Fruits', slug: 'fruits' }, rating: 4.9, isFeatured: true, stock: 30, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80' },
        { _id: 'f3', name: 'Pure Country Farm Milk', price: 62, originalPrice: 70, weight: '1 Litre', category: { name: 'Dairy & Eggs', slug: 'dairy' }, rating: 4.7, isFeatured: true, stock: 50, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
        { _id: 'f4', name: 'Whole Wheat Artisan Bread', price: 45, originalPrice: 55, weight: '400g', category: { name: 'Bakery & Bread', slug: 'bakery' }, rating: 4.6, isFeatured: true, stock: 25, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
        { _id: 'f5', name: 'Cold Pressed Orange Juice', price: 99, originalPrice: 120, weight: '500ml', category: { name: 'Beverages', slug: 'beverages' }, rating: 4.8, isFeatured: true, stock: 20, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80' },
        { _id: 'f6', name: 'Crunchy Roasted Almonds', price: 299, originalPrice: 350, weight: '250g', category: { name: 'Snacks & Chips', slug: 'snacks' }, rating: 4.9, isFeatured: true, stock: 40, image: 'https://images.unsplash.com/photo-1508061252966-17df56214578?w=400&q=80' },
        { _id: 'f7', name: 'Organic Baby Spinach', price: 40, originalPrice: 50, weight: '250g', category: { name: 'Fresh Vegetables', slug: 'vegetables' }, rating: 4.7, isFeatured: true, stock: 35, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80' },
        { _id: 'f8', name: 'Fresh Cavendish Bananas', price: 55, originalPrice: 70, weight: '1 Dozen', category: { name: 'Fresh Fruits', slug: 'fruits' }, rating: 4.8, isFeatured: true, stock: 60, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80' }
    ];

    const activeProductsList = products.length > 0 ? products : fallbackProducts;

    const filteredProducts = activeProductsList.filter(p => {
        if (selectedCategory !== 'all') {
            const catMatch = typeof p.category === 'object'
                ? p.category?.slug === selectedCategory || p.category?._id === selectedCategory || p.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase())
                : p.category === selectedCategory;
            if (!catMatch) return false;
        }
        return true;
    });

    const cookingKits = [
        {
            id: 'kit-1',
            title: 'Organic Guacamole Bowl Kit',
            items: '2 Fresh Avocados, 1 Lemon, Cilantro, Red Onion & Sea Salt',
            price: 189,
            origPrice: 240,
            icon: '🥑',
            badge: 'Best Seller'
        },
        {
            id: 'kit-2',
            title: 'Immunity Citrus Juice Kit',
            items: '4 Valencia Oranges, 2 Lemons, Fresh Ginger & Mint Leaves',
            price: 149,
            origPrice: 199,
            icon: '🍊',
            badge: '100% Organic'
        },
        {
            id: 'kit-3',
            title: 'Golden Turmeric Wellness Milk Kit',
            items: '1L Farm Fresh Milk, Fresh Turmeric Root & Organic Honey',
            price: 129,
            origPrice: 170,
            icon: '🥛',
            badge: 'Healthy Choice'
        }
    ];

    const handleAddKit = (kit) => {
        const kitProduct = {
            _id: kit.id,
            name: kit.title,
            price: kit.price,
            discountPrice: kit.price,
            images: [kit.icon],
            unit: 'kit',
            unitValue: 1
        };
        addToCart(kitProduct, 1);
        toast.success(`Added ${kit.title} to cart!`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 pb-16 space-y-12">
                {/* HERO SECTION */}
                <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white py-12 lg:py-16">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold">
                                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-bounce" />
                                    <span>10-Minute Express Dark Store Delivery</span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                                    Farm Fresh Groceries <br />
                                    <span className="bg-gradient-to-r from-yellow-300 via-emerald-200 to-green-300 bg-clip-text text-transparent">
                                        At Your Door in 10 Mins
                                    </span>
                                </h1>

                                <p className="text-gray-200 text-sm md:text-base max-w-xl font-light">
                                    Organic vegetables, fresh fruits, dairy, bread & daily essentials delivered straight from local dark stores.
                                </p>

                                {/* Search Form */}
                                <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto lg:mx-0">
                                    <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-2xl">
                                        <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search 'fresh milk', 'apples', 'organic bread'..."
                                            className="w-full px-3 py-2.5 text-gray-800 placeholder-gray-400 bg-transparent outline-none text-sm font-medium"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 text-xs"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </form>

                                {/* Quick Category Chips */}
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-[11px]">
                                    <span className="text-gray-300 font-medium">Popular:</span>
                                    {['Fresh Milk', 'Organic Tomato', 'Apples', 'Whole Bread', 'Juices'].map((tag, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setSearchQuery(tag);
                                                router.push(`/search?q=${encodeURIComponent(tag)}`);
                                            }}
                                            className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/10 transition"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right Hero Feature Cards */}
                            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                                <div className="bg-white/10 backdrop-blur-lg border border-white/15 p-4 rounded-2xl text-center hover:bg-white/20 transition group">
                                    <div className="w-10 h-10 bg-yellow-400/20 text-yellow-300 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-sm text-white">10 Min Express</h3>
                                    <p className="text-[11px] text-gray-300 mt-0.5">Lighting fast delivery</p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-lg border border-white/15 p-4 rounded-2xl text-center hover:bg-white/20 transition group">
                                    <div className="w-10 h-10 bg-emerald-400/20 text-emerald-300 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-sm text-white">100% Organic</h3>
                                    <p className="text-[11px] text-gray-300 mt-0.5">Direct from local farms</p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-lg border border-white/15 p-4 rounded-2xl text-center hover:bg-white/20 transition group">
                                    <div className="w-10 h-10 bg-blue-400/20 text-blue-300 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-sm text-white">Live Tracking</h3>
                                    <p className="text-[11px] text-gray-300 mt-0.5">Real-time driver map</p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-lg border border-white/15 p-4 rounded-2xl text-center hover:bg-white/20 transition group">
                                    <div className="w-10 h-10 bg-rose-400/20 text-rose-300 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                                        <BadgePercent className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-sm text-white">Best Discounts</h3>
                                    <p className="text-[11px] text-gray-300 mt-0.5">Unbeatable prices</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* INSTANT PROMO COUPONS STRIP */}
                <section className="container mx-auto px-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold">
                                <Tag className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Instant Offer</span>
                                <p className="text-xs md:text-sm font-bold text-gray-900 mt-0.5">Get Flat 50% OFF on your first grocery order!</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto">
                            <div className="bg-gray-100 px-3 py-1.5 rounded-xl border border-dashed border-gray-300 font-mono text-xs font-black text-gray-800">
                                FRESH50
                            </div>
                            <button
                                onClick={() => copyCouponCode('FRESH50')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm"
                            >
                                {copiedCode === 'FRESH50' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedCode === 'FRESH50' ? 'Copied' : 'Copy Code'}</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* CATEGORIES SECTION */}
                <section className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                                Explore Categories
                            </h2>
                            <p className="text-gray-500 text-xs mt-0.5">Fresh items categorized for quick shopping</p>
                        </div>
                        <Link
                            href="/category"
                            className="flex items-center gap-1 text-emerald-600 font-bold hover:text-emerald-700 text-xs group"
                        >
                            <span>View All</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {displayCategories.map((cat) => (
                            <Link
                                key={cat._id}
                                href={`/category/${cat.slug || cat._id}`}
                                className="group bg-white p-3 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all text-center flex flex-col items-center hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-2 group-hover:scale-110 group-hover:bg-emerald-100 transition">
                                    {cat.icon || '🛍️'}
                                </div>
                                <h3 className="font-bold text-gray-800 text-xs line-clamp-1 group-hover:text-emerald-600 transition">
                                    {cat.name}
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    {cat.productCount || 0}+ Items
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* COOKING KITS / RECIPE BUNDLES */}
                <section className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 shadow-xl space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold">
                                    <Utensils className="w-3.5 h-3.5 text-yellow-300" />
                                    <span>Fresh 1-Click Recipe Kits</span>
                                </div>
                                <h2 className="text-2xl font-black">All Ingredients in One Box</h2>
                            </div>
                            <Link href="/blog" className="text-xs text-emerald-200 font-bold hover:underline self-start md:self-auto">
                                Browse All Recipes & Kits →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {cookingKits.map((kit) => (
                                <div key={kit.id} className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-3xl">{kit.icon}</span>
                                            <span className="bg-yellow-400 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                                                {kit.badge}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-sm text-white">{kit.title}</h3>
                                        <p className="text-[11px] text-gray-300 mt-1">{kit.items}</p>
                                    </div>

                                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                                        <div>
                                            <span className="text-base font-black text-white">₹{kit.price}</span>
                                            <span className="text-[10px] text-gray-300 line-through ml-1">₹{kit.origPrice}</span>
                                        </div>
                                        <button
                                            onClick={() => handleAddKit(kit)}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow flex items-center gap-1"
                                        >
                                            <span>Add Kit</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FEATURED PRODUCTS SECTION (COMPACT 5-6 COLUMNS) */}
                <section className="container mx-auto px-4 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500 fill-current" />
                                All Fresh Products & Grocery Essentials
                            </h2>
                            <p className="text-gray-500 text-xs mt-0.5">Browse and buy anything directly from our entire store catalog below with 10-minute delivery</p>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 max-w-full">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                                    selectedCategory === 'all'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                All Products ({activeProductsList.length})
                            </button>
                            {displayCategories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => setSelectedCategory(cat.slug || cat._id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                                        selectedCategory === (cat.slug || cat._id)
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {cat.icon || ''} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid - Compact 5-6 columns */}
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
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                            {filteredProducts.map((prod) => (
                                <ProductCard
                                    key={prod._id}
                                    product={prod}
                                    onQuickView={(p) => setQuickViewProduct(p)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm max-w-sm mx-auto">
                            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <h3 className="text-sm font-bold text-gray-800">No products found</h3>
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className="mt-3 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}

                    <div className="text-center pt-4">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow"
                        >
                            <span>View Complete Store Catalog</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

                {/* CUSTOMER REVIEWS */}
                <section className="container mx-auto px-4">
                    <div className="text-center max-w-lg mx-auto mb-6">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900">Loved by 50,000+ Happy Families</h2>
                        <p className="text-xs text-gray-500 mt-1">Here is what our customers have to say about FreshCart</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                            <div className="flex items-center gap-1 text-amber-400">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                "Delivered in literally 8 minutes! Vegetables were so fresh, felt like they were plucked from the garden right now."
                            </p>
                            <div className="text-xs font-bold text-gray-900">Ananya R. • Bandra West</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                            <div className="flex items-center gap-1 text-amber-400">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                "The live order map tracker is amazing. I could watch the delivery partner arrive at my building door."
                            </p>
                            <div className="text-xs font-bold text-gray-900">Vikram S. • Andheri East</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                            <div className="flex items-center gap-1 text-amber-400">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                "Great discounts with promo codes and very clean packaging. FreshCart is now my default daily grocery app."
                            </p>
                            <div className="text-xs font-bold text-gray-900">Pooja M. • Powai</div>
                        </div>
                    </div>
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
