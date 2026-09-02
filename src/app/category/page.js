'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCartBar from '@/components/cart/FloatingCartBar';
import { Search, ChevronRight, Grid, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/categories');
                const data = await res.json();
                if (data.categories) {
                    setCategories(data.categories);
                }
            } catch (err) {
                console.error('Failed to load categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Fallback sample categories if DB is empty
    const displayCategories = categories.length > 0 ? categories : [
        { _id: '1', name: 'Fresh Vegetables', slug: 'vegetables', icon: '🥦', productCount: 24, description: 'Organic farm fresh greens, root vegetables, peppers, and tomatoes.' },
        { _id: '2', name: 'Fresh Fruits', slug: 'fruits', icon: '🍎', productCount: 18, description: 'Juicy apples, berries, citrus, bananas, and exotic seasonal fruits.' },
        { _id: '3', name: 'Dairy & Eggs', slug: 'dairy', icon: '🥛', productCount: 15, description: 'Pure milk, farm eggs, cheese, butter, paneer, and fresh yogurt.' },
        { _id: '4', name: 'Bakery & Bread', slug: 'bakery', icon: '🍞', productCount: 12, description: 'Artisanal breads, buns, croissants, cookies, and tea cakes.' },
        { _id: '5', name: 'Beverages', slug: 'beverages', icon: '🧃', productCount: 20, description: 'Cold pressed juices, herbal teas, sparkling water, and energy drinks.' },
        { _id: '6', name: 'Snacks & Chips', slug: 'snacks', icon: '🍿', productCount: 30, description: 'Crunchy chips, roasted nuts, popcorn, and evening munchies.' },
        { _id: '7', name: 'Cooking Essentials', slug: 'pantry', icon: '🌾', productCount: 40, description: 'Organic rice, pulses, cold pressed oils, flour, and spices.' },
        { _id: '8', name: 'Frozen Foods', slug: 'frozen', icon: '🧊', productCount: 14, description: 'Frozen green peas, potato fries, ice creams, and ready-to-cook snacks.' }
    ];

    const filteredCategories = displayCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Link href="/" className="hover:text-emerald-600">Home</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-900 font-semibold">All Categories</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    <Grid className="w-8 h-8 text-emerald-600" />
                                    Browse Grocery Categories
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Sourced fresh daily from farm to kitchen
                                </p>
                            </div>

                            {/* Search Filter */}
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search category name..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse space-y-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto"></div>
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredCategories.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredCategories.map((cat) => (
                                <Link
                                    key={cat._id}
                                    href={`/category/${cat.slug || cat._id}`}
                                    className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 group-hover:bg-emerald-100 transition shadow-inner">
                                            {cat.icon || '🛍️'}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition">
                                            {cat.name}
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                            {cat.description || 'Explore top quality products under this category.'}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                                        <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full">
                                            {cat.productCount || 0} Products
                                        </span>
                                        <span className="flex items-center text-emerald-600 font-bold group-hover:translate-x-1 transition">
                                            Explore <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto my-12">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-800">No categories found</h3>
                            <p className="text-sm text-gray-500 mt-1">No category matched "{searchQuery}"</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <FloatingCartBar />
        </div>
    );
}
