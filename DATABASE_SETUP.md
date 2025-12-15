# Database Setup Guide

## Prerequisites

Before seeding the database, you need to set up MongoDB Atlas (free tier):

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (select the free tier)
4. Wait for the cluster to be created (2-3 minutes)

### 2. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It will look like: `mongodb+srv://username:<password>@cluster.mongodb.net/`

### 3. Configure Environment Variables

1. Create a `.env.local` file in the project root
2. Add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/grocery-delivery?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-secret-key-here-use-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Google Gemini AI (optional for now)
GEMINI_API_KEY=your-gemini-api-key-here

# Google Maps (optional for now)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Cloudinary (optional for now)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

**Important**: Replace the placeholders with your actual values!

### 4. Generate NextAuth Secret

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

## Seed the Database

Once you've configured `.env.local`, run:

```bash
npm run seed
```

This will:
- ✅ Clear existing data
- ✅ Create 6 categories (Fruits & Vegetables, Dairy & Eggs, Bakery, Meat & Seafood, Beverages, Snacks)
- ✅ Create 15+ products with images
- ✅ Create 3 demo users (Admin, Customer, Delivery Partner)

## Demo Credentials

After seeding, you can login with:

### Admin Account
- **Email**: admin@freshcart.com
- **Password**: admin123

### Customer Account
- **Email**: customer@example.com
- **Password**: customer123

### Delivery Partner Account
- **Email**: delivery@freshcart.com
- **Password**: delivery123

## Verify Database

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. You should see:
   - `categories` collection with 6 documents
   - `products` collection with 15+ documents
   - `users` collection with 3 documents

## Troubleshooting

### Error: "MONGODB_URI is not defined"
- Make sure you created `.env.local` file
- Check that the file is in the project root
- Restart the dev server after creating the file

### Error: "MongoServerError: bad auth"
- Check your MongoDB username and password
- Make sure you replaced `<password>` with your actual password
- Ensure there are no special characters that need URL encoding

### Error: "Could not connect to MongoDB"
- Check your internet connection
- Verify your MongoDB Atlas cluster is running
- Make sure your IP address is whitelisted in MongoDB Atlas (Network Access)

## Next Steps

After seeding:
1. Restart your dev server: `npm run dev`
2. Try logging in with demo credentials
3. Browse the products on the home page
4. Test the authentication system
