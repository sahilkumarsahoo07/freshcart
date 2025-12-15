# API Testing Script for FreshCart Grocery Delivery App
# Run this script to test all available APIs

Write-Host "🧪 Testing FreshCart APIs..." -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: Register a new user
Write-Host "1️⃣  Testing User Registration..." -ForegroundColor Cyan
$registerBody = @{
    name = "Test User"
    email = "testuser$(Get-Random)@example.com"
    password = "test123456"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Body $registerBody `
        -ContentType "application/json"
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "User: $($response.user.name) ($($response.user.email))" -ForegroundColor White
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get session (should be null if not logged in)
Write-Host "2️⃣  Testing Session API..." -ForegroundColor Cyan
try {
    $session = Invoke-RestMethod -Uri "$baseUrl/api/auth/session" -Method GET
    
    if ($session.user) {
        Write-Host "✅ Session found!" -ForegroundColor Green
        Write-Host "Logged in as: $($session.user.name) ($($session.user.email))" -ForegroundColor White
    } else {
        Write-Host "ℹ️  No active session (not logged in)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Session check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Available Demo Accounts:" -ForegroundColor Green
Write-Host "  Admin: admin@freshcart.com / admin123" -ForegroundColor White
Write-Host "  Customer: customer@example.com / customer123" -ForegroundColor White
Write-Host "  Delivery: delivery@freshcart.com / delivery123" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Test in Browser:" -ForegroundColor Green
Write-Host "  Login: http://localhost:3000/login" -ForegroundColor White
Write-Host "  Signup: http://localhost:3000/signup" -ForegroundColor White
Write-Host "  Home: http://localhost:3000" -ForegroundColor White
Write-Host ""
