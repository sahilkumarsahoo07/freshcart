import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

// POST - Create new product (Admin only)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.price || !data.category || !data.stock) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create product
        const product = await Product.create({
            name: data.name,
            description: data.description,
            category: data.category,
            brand: data.brand,
            price: data.price,
            discountPrice: data.discountPrice,
            stock: data.stock,
            unit: data.unit,
            unitValue: data.unitValue,
            images: data.images || [],
            tags: data.tags || [],
            isFeatured: data.featured || false, // Form sends 'featured' but DB uses 'isFeatured'
        });

        // Populate category
        await product.populate('category');

        return NextResponse.json({
            message: 'Product created successfully',
            product
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
