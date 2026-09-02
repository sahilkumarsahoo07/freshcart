import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
    persist(
        (set, get) => ({
            items: [],

            // Add item to wishlist
            addItem: (product) => {
                const items = get().items;
                const exists = items.some((item) => item._id === product._id);
                if (!exists) {
                    set({ items: [...items, product] });
                }
            },

            // Remove item from wishlist
            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item._id !== productId),
                });
            },

            // Toggle item in wishlist
            toggleItem: (product) => {
                const items = get().items;
                const exists = items.some((item) => item._id === product._id);
                if (exists) {
                    set({ items: items.filter((item) => item._id !== product._id) });
                    return false; // Removed
                } else {
                    set({ items: [...items, product] });
                    return true; // Added
                }
            },

            // Check if item is in wishlist
            isInWishlist: (productId) => {
                return get().items.some((item) => item._id === productId);
            },

            // Clear wishlist
            clearWishlist: () => {
                set({ items: [] });
            },

            // Get wishlist count
            getCount: () => {
                return get().items.length;
            },
        }),
        {
            name: 'wishlist-storage', // localStorage key
        }
    )
);

export default useWishlistStore;
