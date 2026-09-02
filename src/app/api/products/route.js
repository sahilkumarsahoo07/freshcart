import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

// In-Memory product query cache
const productCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const cacheKey = searchParams.toString();
        const now = Date.now();

        if (productCache.has(cacheKey)) {
            const cached = productCache.get(cacheKey);
            if (now - cached.timestamp < CACHE_TTL) {
                return NextResponse.json(cached.data, {
                    headers: {
                        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
                    }
                });
            }
        }

        await connectDB();

        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit')) || 20;
        const page = parseInt(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        let query = {};

        // Filter by category
        if (category) {
            const categoryDoc = await Category.findOne({ slug: category }).lean();
            if (categoryDoc) {
                query.category = categoryDoc._id;
            }
        }

        // Filter by featured
        if (featured === 'true') {
            query.isFeatured = true;
        }

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category', 'name slug icon')
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .lean(),
            Product.countDocuments(query)
        ]);

        const responseData = {
            products,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };

        // Cache response
        productCache.set(cacheKey, { timestamp: now, data: responseData });

        return NextResponse.json(responseData, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
            }
        });
    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
