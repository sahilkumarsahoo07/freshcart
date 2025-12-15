// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local BEFORE importing anything else
config({ path: join(__dirname, '..', '.env.local') });

// Now import the rest after env vars are loaded
import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';

const categories = [
    {
        name: 'Fruits & Vegetables',
        slug: 'fruits-vegetables',
        description: 'Fresh fruits and vegetables delivered daily',
        icon: '🥬',
        order: 1,
    },
    {
        name: 'Dairy & Eggs',
        slug: 'dairy-eggs',
        description: 'Fresh dairy products and farm eggs',
        icon: '🥛',
        order: 2,
    },
    {
        name: 'Bakery',
        slug: 'bakery',
        description: 'Freshly baked bread and pastries',
        icon: '🍞',
        order: 3,
    },
    {
        name: 'Meat & Seafood',
        slug: 'meat-seafood',
        description: 'Premium quality meat and fresh seafood',
        icon: '🍖',
        order: 4,
    },
    {
        name: 'Beverages',
        slug: 'beverages',
        description: 'Refreshing drinks and beverages',
        icon: '🥤',
        order: 5,
    },
    {
        name: 'Snacks',
        slug: 'snacks',
        description: 'Tasty snacks and munchies',
        icon: '🍿',
        order: 6,
    },
];

const products = [
    // Fruits & Vegetables
    {
        name: 'Fresh Tomatoes',
        description: 'Organic red tomatoes, perfect for salads and cooking',
        price: 60,
        discountPrice: 50,
        categorySlug: 'fruits-vegetables',
        brand: 'FreshFarm',
        images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500'],
        stock: 100,
        unit: 'kg',
        unitValue: 1,
        tags: ['organic', 'fresh', 'vegetables'],
        isFeatured: true,
    },
    {
        name: 'Green Apples',
        description: 'Crisp and juicy green apples from Kashmir',
        price: 180,
        discountPrice: 150,
        categorySlug: 'fruits-vegetables',
        brand: 'FreshFarm',
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500'],
        stock: 80,
        unit: 'kg',
        unitValue: 1,
        tags: ['fresh', 'fruits', 'organic'],
        isFeatured: true,
    },
    {
        name: 'Fresh Spinach',
        description: 'Organic spinach leaves, rich in iron',
        price: 40,
        categorySlug: 'fruits-vegetables',
        brand: 'GreenLeaf',
        images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'],
        stock: 50,
        unit: 'kg',
        unitValue: 0.5,
        tags: ['organic', 'leafy', 'vegetables'],
    },
    {
        name: 'Bananas',
        description: 'Fresh yellow bananas, rich in potassium',
        price: 50,
        categorySlug: 'fruits-vegetables',
        brand: 'FreshFarm',
        images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500'],
        stock: 120,
        unit: 'dozen',
        unitValue: 1,
        tags: ['fresh', 'fruits'],
    },

    // Dairy & Eggs
    {
        name: 'Fresh Milk',
        description: 'Full cream fresh milk from local farms',
        price: 60,
        categorySlug: 'dairy-eggs',
        brand: 'Amul',
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500'],
        stock: 200,
        unit: 'liter',
        unitValue: 1,
        tags: ['dairy', 'fresh'],
        isFeatured: true,
    },
    {
        name: 'Farm Fresh Eggs',
        description: 'Brown eggs from free-range chickens',
        price: 90,
        discountPrice: 75,
        categorySlug: 'dairy-eggs',
        brand: 'Country Eggs',
        images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500'],
        stock: 150,
        unit: 'dozen',
        unitValue: 1,
        tags: ['eggs', 'protein', 'fresh'],
        isFeatured: true,
    },
    {
        name: 'Greek Yogurt',
        description: 'Thick and creamy Greek yogurt',
        price: 120,
        categorySlug: 'dairy-eggs',
        brand: 'Epigamia',
        images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500'],
        stock: 60,
        unit: 'piece',
        unitValue: 1,
        tags: ['dairy', 'healthy', 'protein'],
    },

    // Bakery
    {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread',
        price: 45,
        categorySlug: 'bakery',
        brand: 'Harvest Gold',
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'],
        stock: 80,
        unit: 'piece',
        unitValue: 1,
        tags: ['bakery', 'bread', 'healthy'],
    },
    {
        name: 'Croissants',
        description: 'Buttery and flaky French croissants',
        price: 150,
        categorySlug: 'bakery',
        brand: 'Theobroma',
        images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500'],
        stock: 40,
        unit: 'pack',
        unitValue: 6,
        tags: ['bakery', 'pastry', 'breakfast'],
    },

    // Meat & Seafood
    {
        name: 'Chicken Breast',
        description: 'Boneless chicken breast, fresh and tender',
        price: 280,
        discountPrice: 250,
        categorySlug: 'meat-seafood',
        brand: 'Licious',
        images: ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500'],
        stock: 50,
        unit: 'kg',
        unitValue: 1,
        tags: ['meat', 'protein', 'chicken'],
        isFeatured: true,
    },
    {
        name: 'Fresh Prawns',
        description: 'Large fresh prawns from coastal waters',
        price: 650,
        categorySlug: 'meat-seafood',
        brand: 'FreshCatch',
        images: ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500'],
        stock: 30,
        unit: 'kg',
        unitValue: 0.5,
        tags: ['seafood', 'protein'],
    },

    // Beverages
    {
        name: 'Orange Juice',
        description: '100% pure orange juice, no added sugar',
        price: 120,
        categorySlug: 'beverages',
        brand: 'Tropicana',
        images: ['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500'],
        stock: 100,
        unit: 'liter',
        unitValue: 1,
        tags: ['beverages', 'juice', 'healthy'],
    },
    {
        name: 'Green Tea',
        description: 'Premium green tea bags for a healthy lifestyle',
        price: 250,
        categorySlug: 'beverages',
        brand: 'Lipton',
        images: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500'],
        stock: 70,
        unit: 'pack',
        unitValue: 100,
        tags: ['beverages', 'tea', 'healthy'],
    },

    // Snacks
    {
        name: 'Potato Chips',
        description: 'Crispy and crunchy potato chips',
        price: 40,
        categorySlug: 'snacks',
        brand: 'Lays',
        images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500'],
        stock: 150,
        unit: 'pack',
        unitValue: 1,
        tags: ['snacks', 'chips'],
    },
    {
        name: 'Mixed Nuts',
        description: 'Roasted and salted mixed nuts',
        price: 350,
        categorySlug: 'snacks',
        brand: 'Nutraj',
        images: ['https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500'],
        stock: 60,
        unit: 'pack',
        unitValue: 500,
        tags: ['snacks', 'healthy', 'nuts'],
    },
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        console.log('📡 MongoDB URI:', process.env.MONGODB_URI ? 'Loaded ✅' : 'Missing ❌');

        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Category.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});

        // Create categories
        console.log('📁 Creating categories...');
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ Created ${createdCategories.length} categories`);

        // Map category slugs to IDs
        const categoryMap = {};
        createdCategories.forEach((cat) => {
            categoryMap[cat.slug] = cat._id;
        });

        // Create products with category references
        console.log('🛒 Creating products...');
        const productsWithCategories = products.map((product) => ({
            ...product,
            category: categoryMap[product.categorySlug],
        }));
        const createdProducts = await Product.insertMany(productsWithCategories);
        console.log(`✅ Created ${createdProducts.length} products`);

        // Create demo users
        console.log('👥 Creating demo users...');

        const demoUsers = [
            {
                name: 'Admin User',
                email: 'admin@freshcart.com',
                password: 'admin123',
                role: 'ADMIN',
            },
            {
                name: 'John Doe',
                email: 'customer@example.com',
                password: 'customer123',
                role: 'CUSTOMER',
            },
            {
                name: 'Delivery Partner',
                email: 'delivery@freshcart.com',
                password: 'delivery123',
                role: 'DELIVERY',
            },
        ];

        const createdUsers = await User.insertMany(demoUsers);
        console.log(`✅ Created ${createdUsers.length} demo users`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 Demo Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin:');
        console.log('  Email: admin@freshcart.com');
        console.log('  Password: admin123');
        console.log('\nCustomer:');
        console.log('  Email: customer@example.com');
        console.log('  Password: customer123');
        console.log('\nDelivery Partner:');
        console.log('  Email: delivery@freshcart.com');
        console.log('  Password: delivery123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
