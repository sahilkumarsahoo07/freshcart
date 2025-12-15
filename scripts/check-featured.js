// Quick script to check if featured products exist in database
// Run this with: node scripts/check-featured.js

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

// Product Schema (simplified)
const productSchema = new mongoose.Schema({
    name: String,
    featured: Boolean,
});

const Product = mongoose.model('Product', productSchema);

async function checkFeaturedProducts() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        // Find all products
        const allProducts = await Product.find({}, 'name featured');
        console.log(`📦 Total products: ${allProducts.length}\n`);

        // Find featured products
        const featuredProducts = await Product.find({ featured: true }, 'name featured');
        console.log(`⭐ Featured products: ${featuredProducts.length}`);

        if (featuredProducts.length > 0) {
            console.log('\nFeatured products list:');
            featuredProducts.forEach(p => {
                console.log(`  - ${p.name} (featured: ${p.featured})`);
            });
        } else {
            console.log('\n❌ No featured products found!');
            console.log('\nAll products:');
            allProducts.forEach(p => {
                console.log(`  - ${p.name} (featured: ${p.featured || false})`);
            });
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkFeaturedProducts();
