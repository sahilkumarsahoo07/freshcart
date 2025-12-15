# 🛒 FreshCart - Grocery Delivery Application

A modern, full-stack grocery delivery platform built with Next.js 16, featuring real-time order tracking, role-based authentication, and an intuitive user experience for customers, delivery partners, and administrators.

## ✨ Features

### 🛍️ Customer Features
- **Browse & Search**: Explore products by categories with advanced search and filtering
- **Smart Cart Management**: Add, update, and remove items with real-time price calculations
- **Saved Addresses**: Store multiple delivery addresses with interactive map selection
- **Secure Checkout**: Streamlined checkout process with multiple payment options
- **Order Tracking**: Real-time order status updates with live map tracking
- **Order History**: View past orders and reorder with one click
- **Email Verification**: OTP-based email verification for secure account creation

### 🚚 Delivery Partner Features
- **Real-Time Notifications**: Instant Socket.io-powered order notifications
- **Order Management**: Accept, reject, and update order status
- **Live Tracking**: Update delivery location in real-time
- **Earnings Dashboard**: Track deliveries and earnings
- **Route Optimization**: Interactive maps for efficient delivery routes

### 👨‍💼 Admin Features
- **Product Management**: Create, update, and delete products with image uploads
- **Category Management**: Organize products into categories
- **User Management**: Create and manage delivery partner accounts
- **Order Overview**: Monitor all orders and their statuses
- **Analytics Dashboard**: Track sales, popular products, and delivery performance

### 🔐 Authentication & Security
- **Role-Based Access Control**: Separate interfaces for customers, delivery partners, and admins
- **NextAuth Integration**: Secure JWT-based authentication
- **Email Verification**: OTP verification using Resend/Nodemailer
- **Password Reset**: Secure password recovery flow
- **Protected Routes**: Middleware-based route protection

### 🌐 Real-Time Features
- **Socket.io Integration**: Real-time order notifications and status updates
- **Live Order Tracking**: Track delivery partners on interactive maps
- **Instant Updates**: No polling - efficient WebSocket connections
- **Multi-User Support**: Handle multiple simultaneous orders

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Maps**: React Leaflet, Google Maps API
- **Notifications**: React Hot Toast
- **File Upload**: React Dropzone

### Backend
- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **Real-Time**: Socket.io
- **Email**: Nodemailer
- **Image Storage**: Cloudinary
- **AI Integration**: Google Generative AI (Gemini)

### Development Tools
- **Linting**: ESLint
- **Package Manager**: npm
- **Version Control**: Git

## 📁 Project Structure

```
grocery-delivery-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API routes
│   │   ├── cart/              # Shopping cart page
│   │   ├── checkout/          # Checkout flow
│   │   ├── customer/          # Customer dashboard
│   │   ├── delivery/          # Delivery partner dashboard
│   │   ├── login/             # Authentication pages
│   │   ├── my-orders/         # Order history
│   │   ├── products/          # Product listing & details
│   │   └── settings/          # User settings
│   ├── components/            # Reusable React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── auth/             # Authentication components
│   │   ├── cart/             # Cart components
│   │   ├── checkout/         # Checkout components
│   │   ├── delivery/         # Delivery partner components
│   │   ├── orders/           # Order tracking components
│   │   └── products/         # Product display components
│   ├── lib/                   # Utility functions
│   │   ├── db.js             # MongoDB connection
│   │   ├── auth.js           # NextAuth configuration
│   │   └── socket.js         # Socket.io server setup
│   ├── models/                # Mongoose schemas
│   │   ├── User.js           # User model
│   │   ├── Product.js        # Product model
│   │   ├── Order.js          # Order model
│   │   ├── Cart.js           # Cart model
│   │   ├── Address.js        # Address model
│   │   └── Category.js       # Category model
│   ├── store/                 # Zustand state management
│   └── middleware.js          # Route protection middleware
├── scripts/                   # Utility scripts
│   └── seed.js               # Database seeding script
├── public/                    # Static assets
├── .env.local                # Environment variables
└── server.js                 # Custom server with Socket.io

```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd grocery-delivery-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=your-secret-key-here

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Google Maps (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Cloudinary (optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Gemini AI (optional)
GEMINI_API_KEY=your-gemini-api-key

# Email (optional)
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_FROM=noreply@freshcart.com
```

4. **Seed the database**
```bash
npm run seed
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

After seeding, use these credentials to explore different roles:

**Admin Account**
- Email: `admin@freshcart.com`
- Password: `admin123`

**Customer Account**
- Email: `customer@example.com`
- Password: `customer123`

**Delivery Partner Account**
- Email: `delivery@freshcart.com`
- Password: `delivery123`

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Database Setup Guide](./DATABASE_SETUP.md) - MongoDB configuration and seeding

## 🎯 Key Workflows

### Customer Journey
1. Sign up with email verification
2. Browse products by category
3. Add items to cart
4. Save delivery addresses with map selection
5. Complete checkout
6. Track order in real-time
7. View order history

### Delivery Partner Journey
1. Receive real-time order notifications
2. Accept or reject orders
3. Update order status (picked up, in transit, delivered)
4. Update location for live tracking
5. View earnings and delivery history

### Admin Journey
1. Manage product catalog
2. Create delivery partner accounts
3. Monitor all orders
4. View analytics and reports

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with Socket.io
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
```

## 🌟 Highlights

- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Real-Time Updates**: No page refreshes needed for order updates
- **Scalable Architecture**: Modular component structure
- **Type-Safe**: Mongoose schemas for data validation
- **SEO Optimized**: Server-side rendering with Next.js
- **Mobile Responsive**: Works seamlessly on all devices
- **Performance**: Optimized images and lazy loading

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

Copyright © 2025. All Rights Reserved.

This project is proprietary and confidential. Unauthorized copying, distribution, modification, or use of this software, via any medium, is strictly prohibited without explicit written permission from the owner.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by modern e-commerce platforms
- Maps powered by [Leaflet](https://leafletjs.com/) and Google Maps
- Real-time features powered by [Socket.io](https://socket.io/)

---

**Made with ❤️ for learning and demonstration purposes**
