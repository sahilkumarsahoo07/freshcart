# FreshCart API Documentation

## 🚀 Base URL
```
http://localhost:3000
```

---

## 🔐 Authentication APIs

### 1. Register New User
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

**Error Responses:**
- `400` - Missing fields or user already exists
- `500` - Server error

**Test with PowerShell:**
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

### 2. Login (NextAuth)
**Endpoint:** `POST /api/auth/callback/credentials`

**Note:** It's easier to use the login page at `/login` rather than calling this API directly.

**Login via Browser:**
```
http://localhost:3000/login
```

**Demo Credentials:**
- **Admin:** admin@freshcart.com / admin123
- **Customer:** customer@example.com / customer123
- **Delivery:** delivery@freshcart.com / delivery123

---

### 3. Get Session
**Endpoint:** `GET /api/auth/session`

**Success Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  },
  "expires": "2024-01-15T12:00:00.000Z"
}
```

**Test with PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/session"
```

---

### 4. Logout
**Endpoint:** `POST /api/auth/signout`

**Or use the UI:**
- Click user menu → Sign Out

---

## 📊 Database Collections

Your MongoDB now has:

### Categories (6 items)
- Fruits & Vegetables
- Dairy & Eggs
- Bakery
- Meat & Seafood
- Beverages
- Snacks

### Products (15 items)
- Fresh Tomatoes, Green Apples, Spinach, Bananas
- Fresh Milk, Farm Eggs, Greek Yogurt
- Whole Wheat Bread, Croissants
- Chicken Breast, Fresh Prawns
- Orange Juice, Green Tea
- Potato Chips, Mixed Nuts

### Users (3 demo accounts)
- Admin User
- John Doe (Customer)
- Delivery Partner

---

## 🧪 Testing the APIs

### Option 1: Use the Test Script
```powershell
.\scripts\test-apis.ps1
```

### Option 2: Use the Browser
1. **Home Page:** http://localhost:3000
2. **Login:** http://localhost:3000/login
3. **Signup:** http://localhost:3000/signup

### Option 3: Use PowerShell Manually
```powershell
# Test registration
$body = @{
    name = "New User"
    email = "newuser@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Check session
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/session"
```

---

## 🔜 Coming Soon APIs

These will be created in the next phase:

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product by ID
- `GET /api/products/category/[slug]` - Get products by category
- `GET /api/products/search?q=query` - Search products

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[id]` - Update cart item
- `DELETE /api/cart/[id]` - Remove from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `GET /api/orders/[id]/track` - Track order

### Admin
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

---

## 📝 Notes

- All APIs require the dev server to be running: `npm run dev`
- Authentication uses NextAuth with JWT sessions
- Protected routes will redirect to login if not authenticated
- MongoDB connection string is loaded from `.env.local`

---

## 🐛 Troubleshooting

**API returns 500 error:**
- Check if MongoDB is connected
- Verify `.env.local` has correct `MONGODB_URI`
- Check terminal for error messages

**Session not persisting:**
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Clear browser cookies and try again

**CORS errors:**
- Next.js handles CORS automatically for same-origin requests
- For external testing, you may need to configure CORS in `next.config.js`
