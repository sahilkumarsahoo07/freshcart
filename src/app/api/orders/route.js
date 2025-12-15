import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

// POST - Create new order
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is logged in
        if (!session) {
            return NextResponse.json({ error: 'Please login to place an order' }, { status: 401 });
        }

        await connectDB();

        const data = await request.json();
        const { items, deliveryAddress, paymentMethod, totalAmount, deliveryFee } = data;

        // Validate required fields
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.addressLine1) {
            return NextResponse.json({ error: 'Delivery address is incomplete' }, { status: 400 });
        }

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Calculate final amount
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const finalAmount = subtotal + (deliveryFee || 40);

        // Create order WITHOUT auto-assignment - delivery partners will accept manually
        const order = await Order.create({
            user: session.user.id,
            orderNumber,
            items: items.map(item => ({
                product: item.product,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
            })),
            totalAmount: subtotal,
            finalAmount,
            deliveryFee: deliveryFee || 40,
            status: 'PLACED', // Will be CONFIRMED after stock check, then delivery partners can accept
            // No assignedDeliveryPartner - will be set when a partner accepts
            deliveryAddress: {
                fullName: deliveryAddress.fullName,
                phone: deliveryAddress.phone,
                addressLine1: deliveryAddress.addressLine1,
                addressLine2: deliveryAddress.addressLine2 || '',
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                zipCode: deliveryAddress.zipCode,
                instructions: deliveryAddress.instructions || '',
            },
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        });

        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Check if order needs store manager confirmation (any product stock < 4)
        let needsConfirmation = false;
        let lowStockItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product && product.stock < 4) {
                needsConfirmation = true;
                lowStockItems.push(product.name);
            }
        }

        // Auto-confirm if stock is sufficient
        if (!needsConfirmation) {
            order.status = 'CONFIRMED';
            await order.save();
            console.log(`Order ${orderNumber} auto-confirmed (sufficient stock) - awaiting delivery partner acceptance`);

            // Notify ALL delivery partners about the new order
            try {
                const { notifyNewOrder } = await import('@/lib/socket');
                await notifyNewOrder(order);
                console.log(`✅ Notified all delivery partners about order ${orderNumber} - waiting for manual acceptance`);
            } catch (error) {
                console.log('⚠️ Socket.io not available, delivery partners will need to check dashboard manually');
            }
        } else {
            // Requires store manager confirmation
            order.requiresConfirmation = true;
            order.confirmationReason = `Low stock on: ${lowStockItems.join(', ')}`;
            await order.save();
            console.log(`Order ${orderNumber} requires confirmation (low stock)`);

            // Notify store manager via Socket.io
            try {
                const { notifyStoreManager } = await import('@/lib/socket');
                notifyStoreManager(order);
            } catch (error) {
                console.log('Socket.io not available, skipping notification');
            }
        }

        return NextResponse.json({
            success: true,
            message: needsConfirmation
                ? 'Order placed. Awaiting store confirmation due to low stock.'
                : 'Order placed successfully. Delivery partners will be notified to accept your order.',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                finalAmount: order.finalAmount,
                requiresConfirmation: needsConfirmation,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

// GET - Get user's orders
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const orders = await Order.find({ user: session.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
