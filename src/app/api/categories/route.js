import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// In-Memory Server Cache for 60 seconds
let categoriesCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET() {
    try {
        const now = Date.now();
        if (categoriesCache && (now - lastFetchTime < CACHE_TTL)) {
            return NextResponse.json({ categories: categoriesCache }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                }
            });
        }

        await connectDB();

        // 1. Fetch categories
        const categories = await Category.find().sort({ order: 1 }).lean();

        // 2. Fetch product counts in 1 single aggregation query instead of N+1 loop
        const counts = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach(c => {
            if (c._id) countMap[c._id.toString()] = c.count;
        });

        const categoriesWithCount = categories.map(category => ({
            _id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon: category.icon,
            order: category.order,
            productCount: countMap[category._id.toString()] || 0,
        }));

        categoriesCache = categoriesWithCount;
        lastFetchTime = now;

        return NextResponse.json({ categories: categoriesWithCount }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            }
        });
    } catch (error) {
        console.error('Categories API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
        }

        const body = await req.json();
        const { name, slug, description, icon, order } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        const newCategory = await Category.create({
            name,
            slug,
            description,
            icon,
            order: order || 0,
        });

        // Invalidate cache
        categoriesCache = null;

        return NextResponse.json({ category: newCategory }, { status: 201 });
    } catch (error) {
        console.error('Create Category error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
    }
}
