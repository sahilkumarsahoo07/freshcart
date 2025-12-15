import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
    if (io) {
        return io;
    }

    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },
        path: '/api/socket'
    });

    io.on('connection', (socket) => {
        console.log('🔌 Client connected:', socket.id);

        // Delivery partner registers
        socket.on('delivery:register', (partnerId) => {
            socket.join(`delivery:${partnerId}`);
            console.log(`✅ Delivery partner registered: ${partnerId} (Socket: ${socket.id})`);

            // Log all connected delivery partners
            const deliveryRooms = Array.from(io.sockets.adapter.rooms.keys())
                .filter(room => room.startsWith('delivery:'));
            console.log(`📊 Total delivery partners connected: ${deliveryRooms.length}`);
        });

        // Customer/User registers for order updates
        socket.on('user:register', (userId) => {
            socket.join(`user:${userId}`);
            console.log(`✅ User registered for order updates: ${userId} (Socket: ${socket.id})`);
        });

        // Customer joins specific order room for tracking
        socket.on('order:join', (orderId) => {
            socket.join(`order:${orderId}`);
            console.log(`✅ Customer joined order room: ${orderId} (Socket: ${socket.id})`);
        });

        socket.on('order:accept', async ({ orderId, partnerId }) => {
            console.log(`📦 Partner ${partnerId} attempting to accept order ${orderId}`);
            try {
                // Lazy import to avoid loading before env vars are ready
                const { default: Order } = await import('../models/Order.js');
                const { default: connectDB } = await import('./mongodb.js');

                await connectDB();

                const order = await Order.findById(orderId);

                // Check if order is still unassigned
                if (order && !order.assignedDeliveryPartner) {
                    order.assignedDeliveryPartner = partnerId;
                    order.status = 'PREPARING';
                    await order.save();

                    console.log(`✅ Order ${orderId} assigned to ${partnerId}`);

                    // Notify all delivery partners that order is assigned
                    io.emit('order:assigned', { orderId, partnerId });
                    console.log(`📢 Broadcasted order:assigned to all partners`);

                    // Notify the accepted partner
                    socket.emit('order:accepted', { orderId, success: true });

                } else {
                    console.log(`❌ Order ${orderId} already assigned to ${order?.assignedDeliveryPartner}`);
                    // Order already assigned
                    socket.emit('order:accepted', { orderId, success: false, message: 'Order already assigned' });
                }
            } catch (error) {
                console.error('❌ Error accepting order:', error);
                socket.emit('order:accepted', { orderId, success: false, message: 'Error accepting order' });
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Notify all delivery partners about new order
export const notifyNewOrder = async (order) => {
    try {
        // Get the Socket.io instance using getIO()
        let ioInstance;
        try {
            ioInstance = getIO();
        } catch (error) {
            console.log('⚠️ Socket.io not initialized, cannot notify delivery partners');
            return;
        }

        // Populate order data if needed
        if (!order.items || !order.deliveryAddress) {
            const { default: Order } = await import('../models/Order.js');
            const { default: connectDB } = await import('./mongodb.js');
            await connectDB();
            order = await Order.findById(order._id);
        }

        // Only notify if order is unassigned (manual acceptance system)
        if (order.assignedDeliveryPartner) {
            console.log(`⚠️ Order ${order.orderNumber} already assigned, skipping notification`);
            return;
        }

        const orderData = {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            items: order.items,
            deliveryAddress: order.deliveryAddress,
            finalAmount: order.finalAmount,
            createdAt: order.createdAt,
            status: order.status
        };

        console.log('📢 Broadcasting NEW ORDER to ALL delivery partners:', orderData.orderNumber);
        console.log(`   - Order ID: ${orderData.orderId}`);
        console.log(`   - Amount: ₹${orderData.finalAmount}`);
        console.log(`   - Items: ${orderData.items.length}`);

        // Broadcast to all connected delivery partners
        ioInstance.emit('order:new', orderData);

        // Log connected delivery partners
        const deliveryRooms = Array.from(ioInstance.sockets.adapter.rooms.keys())
            .filter(room => room.startsWith('delivery:'));
        console.log(`✅ Broadcast complete to ${deliveryRooms.length} connected delivery partners`);

    } catch (error) {
        console.error('❌ Error in notifyNewOrder:', error);
    }
};

// Notify store manager about order requiring confirmation
export const notifyStoreManager = (order) => {
    if (io) {
        io.emit('order:confirmation_required', {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            confirmationReason: order.confirmationReason,
            items: order.items,
            createdAt: order.createdAt
        });
        console.log(`Notified store manager about order ${order.orderNumber}`);
    }
};

// Notify customer about order status update
export const notifyOrderStatusUpdate = (order) => {
    try {
        let ioInstance;
        try {
            ioInstance = getIO();
        } catch (error) {
            console.log('⚠️ Socket.io not initialized, cannot notify order status update');
            return;
        }

        const orderData = {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            status: order.status,
            updatedAt: new Date()
        };

        console.log(`📢 Broadcasting order status update: ${orderData.orderNumber} -> ${orderData.status}`);

        // Emit to all clients (customers will filter by their orders)
        ioInstance.emit('order:statusUpdated', orderData);

        // Also emit to specific user if userId is available
        if (order.user) {
            ioInstance.to(`user:${order.user.toString()}`).emit('order:statusUpdated', orderData);
        }

    } catch (error) {
        console.error('❌ Error in notifyOrderStatusUpdate:', error);
    }
};

// Notify customer about new order creation
export const notifyOrderCreated = (order) => {
    try {
        let ioInstance;
        try {
            ioInstance = getIO();
        } catch (error) {
            console.log('⚠️ Socket.io not initialized, cannot notify order creation');
            return;
        }

        const orderData = {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            userId: order.user?.toString(),
            status: order.status,
            createdAt: order.createdAt
        };

        console.log(`📢 Broadcasting new order created: ${orderData.orderNumber}`);
        ioInstance.emit('order:created', orderData);

    } catch (error) {
        console.error('❌ Error in notifyOrderCreated:', error);
    }
};

// Notify customer about delivery location update
export const updateDeliveryLocation = (orderId, locationData) => {
    try {
        let ioInstance;
        try {
            ioInstance = getIO();
        } catch (error) {
            console.log('⚠️ Socket.io not initialized, cannot update delivery location');
            return;
        }

        const updateData = {
            orderId,
            location: locationData.location,
            distanceRemaining: locationData.distanceRemaining,
            estimatedArrival: locationData.estimatedArrival,
            status: locationData.status,
            timestamp: new Date()
        };

        console.log(`📍 Broadcasting delivery location update for order: ${orderId}`);
        console.log(`   - Distance remaining: ${locationData.distanceRemaining?.toFixed(2)} km`);
        console.log(`   - ETA: ${locationData.estimatedArrival}`);

        // Emit to specific order room
        ioInstance.to(`order:${orderId}`).emit('delivery:locationUpdate', updateData);

    } catch (error) {
        console.error('❌ Error in updateDeliveryLocation:', error);
    }
};

