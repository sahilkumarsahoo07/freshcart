'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, Tag, ChevronRight, User } from 'lucide-react';

export default function BlogPage() {
    const [selectedTag, setSelectedTag] = useState('All');

    const posts = [
        {
            id: 1,
            title: '10 Organic Smoothies for High Energy & Immunity',
            excerpt: 'Boost your morning routine with these 5-ingredient organic green smoothies made with fresh spinach, apples & ginger.',
            author: 'Nutritionist Priya Sharma',
            readTime: '4 min read',
            tag: 'Health & Recipes',
            date: 'Sep 02, 2026',
            icon: '🥤'
        },
        {
            id: 2,
            title: 'How to Keep Leafy Greens Fresh for 2 Weeks',
            excerpt: 'Master the secret paper towel technique to extend the crisp freshness of coriander, spinach and lettuce in your fridge.',
            author: 'Chef Rahul Verma',
            readTime: '3 min read',
            tag: 'Storage Hacks',
            date: 'Aug 28, 2026',
            icon: '🥬'
        },
        {
            id: 3,
            title: 'The Truth About Organic Certification Badges',
            excerpt: 'Everything you need to know about understanding farm certification labels and pesticide-free produce standards.',
            author: 'Agri Expert Dr. Mehta',
            readTime: '6 min read',
            tag: 'Organic Living',
            date: 'Aug 20, 2026',
            icon: '🌱'
        },
        {
            id: 4,
            title: 'Quick 15-Minute Italian Avocado Pasta Recipe',
            excerpt: 'Creamy garlic avocado pasta loaded with cherry tomatoes, parmesan cheese, and extra virgin olive oil.',
            author: 'Chef Rahul Verma',
            readTime: '5 min read',
            tag: 'Health & Recipes',
            date: 'Aug 15, 2026',
            icon: '🍝'
        }
    ];

    const filtered = selectedTag === 'All'
        ? posts
        : posts.filter(p => p.tag === selectedTag);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl space-y-10">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        FreshCart Health & Recipe Blog
                    </h1>
                    <p className="text-xs text-gray-500">Delicious recipes, storage hacks & organic wellness guides</p>

                    {/* Tag Filter */}
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {['All', 'Health & Recipes', 'Storage Hacks', 'Organic Living'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                                    selectedTag === tag
                                        ? 'bg-emerald-600 text-white shadow'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(post => (
                        <div key={post.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition group">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span className="bg-emerald-50 text-emerald-700 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase">
                                        {post.tag}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition">
                                        {post.icon}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900 text-base group-hover:text-emerald-600 transition leading-snug">
                                            {post.title}
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">{post.author}</span>
                                <span className="text-emerald-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                                    Read Article <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
