import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// PUT - Update product (Admin only)
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // In Next.js 15, params is a Promise and must be awaited
        const { id } = await params;
        const data = await request.json();

        console.log('Updating product:', id);
        console.log('Featured value received:', data.featured);

        // Find and update product
        const product = await Product.findByIdAndUpdate(
            id,
            {
                name: data.name,
                description: data.description,
                category: data.category,
                brand: data.brand,
                price: data.price,
                discountPrice: data.discountPrice,
                stock: data.stock,
                unit: data.unit,
                unitValue: data.unitValue,
                images: data.images,
                tags: data.tags,
                isFeatured: data.featured, // Form sends 'featured' but DB uses 'isFeatured'
            },
            { new: true, runValidators: true }
        ).populate('category');

        console.log('Product updated, isFeatured is now:', product.isFeatured);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE - Delete product (Admin only)
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // In Next.js 15, params is a Promise and must be awaited
        const { id } = await params;

        // Find and delete product
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
