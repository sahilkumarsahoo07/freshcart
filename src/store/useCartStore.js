import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            // Add item to cart
            addItem: (product, quantity = 1) => {
                const items = get().items;
                const existingItem = items.find(item => item.product._id === product._id);

                if (existingItem) {
                    // Update quantity if item already exists
                    set({
                        items: items.map(item =>
                            item.product._id === product._id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    // Add new item
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
                set({ items: [] });
            },

            // Get cart total
            getTotal: () => {
                return get().items.reduce((total, item) => {
                    const price = item.product.discountPrice || item.product.price;
                    return total + (price * item.quantity);
                }, 0);
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
