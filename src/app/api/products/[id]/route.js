import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request, { params }) {
    try {
        await connectDB();

        // In Next.js 15, params is a Promise and must be awaited
        const { id } = await params;
        console.log('Fetching product with ID:', id);

        const product = await Product.findById(id).populate('category', 'name slug icon');

        if (!product) {
            console.log('Product not found for ID:', id);
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        console.log('Product found:', product.name);
        return NextResponse.json({ product });
    } catch (error) {
        console.error('Product detail API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product: ' + error.message },
            { status: 500 }
        );
    }
}
