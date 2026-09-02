import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            appliedCoupon: null, // { code, type: 'flat'|'percent', amount: 50, minOrder: 199, maxDiscount: 100 }

            AVAILABLE_COUPONS: [
                { code: 'FRESH50', description: 'Flat ₹50 OFF on orders above ₹199', type: 'flat', discount: 50, minOrder: 199 },
                { code: 'SAVE20', description: '20% OFF up to ₹100 on orders above ₹299', type: 'percent', discount: 20, minOrder: 299, maxDiscount: 100 },
                { code: 'INSTA100', description: 'Flat ₹100 OFF on orders above ₹499', type: 'flat', discount: 100, minOrder: 499 },
                { code: 'SUPER25', description: '25% OFF up to ₹150 on orders above ₹599', type: 'percent', discount: 25, minOrder: 599, maxDiscount: 150 }
            ],

            // Add item to cart
            addItem: (product, quantity = 1) => {
                const items = get().items;
                const existingItem = items.find(item => item.product._id === product._id);

                if (existingItem) {
                    set({
                        items: items.map(item =>
                            item.product._id === product._id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    set({
                        items: [...items, { product, quantity }],
                    });
                }
            },

            // Remove item from cart
            removeItem: (productId) => {
                set({
                    items: get().items.filter(item => item.product._id !== productId),
                });
            },

            // Update item quantity
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set({
                    items: get().items.map(item =>
                        item.product._id === productId
                            ? { ...item, quantity }
                            : item
                    ),
                });
            },

            // Clear cart
            clearCart: () => {
                set({ items: [], appliedCoupon: null });
            },

            // Get raw cart total (subtotal)
            getTotal: () => {
                return get().items.reduce((total, item) => {
                    const price = item.product.discountPrice || item.product.price;
                    return total + (price * item.quantity);
                }, 0);
            },

            // Apply coupon
            applyCoupon: (code) => {
                const coupons = get().AVAILABLE_COUPONS;
                const subtotal = get().getTotal();
                const matched = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());

                if (!matched) {
                    return { success: false, message: 'Invalid coupon code. Try FRESH50 or SAVE20' };
                }

                if (subtotal < matched.minOrder) {
                    return { success: false, message: `Minimum order amount of ₹${matched.minOrder} required for ${matched.code}` };
                }

                set({ appliedCoupon: matched });
                return { success: true, message: `Coupon ${matched.code} applied successfully!` };
            },

            // Remove coupon
            removeCoupon: () => {
                set({ appliedCoupon: null });
            },

            // Calculate coupon discount amount
            getDiscount: () => {
                const coupon = get().appliedCoupon;
                if (!coupon) return 0;

                const subtotal = get().getTotal();
                if (subtotal < coupon.minOrder) return 0;

                if (coupon.type === 'flat') {
                    return Math.min(coupon.discount, subtotal);
                } else if (coupon.type === 'percent') {
                    const calculated = (subtotal * coupon.discount) / 100;
                    return coupon.maxDiscount ? Math.min(calculated, coupon.maxDiscount) : calculated;
                }
                return 0;
            },

            // Final Total after discount
            getFinalTotal: () => {
                const subtotal = get().getTotal();
                const discount = get().getDiscount();
                return Math.max(0, subtotal - discount);
            },

            // Get cart count
            getCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },

            // Get item quantity
            getItemQuantity: (productId) => {
                const item = get().items.find(item => item.product._id === productId);
                return item ? item.quantity : 0;
            },
        }),
        {
            name: 'cart-storage', // localStorage key
        }
    )
);

export default useCartStore;
