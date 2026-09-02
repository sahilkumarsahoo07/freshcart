import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useProductStore = create(
    persist(
        (set, get) => ({
            products: [],
            categories: [],
            lastFetchedProducts: 0,
            lastFetchedCategories: 0,
            loading: false,

            setProducts: (products) => set({ products, lastFetchedProducts: Date.now() }),
            setCategories: (categories) => set({ categories, lastFetchedCategories: Date.now() }),

            fetchCategories: async (force = false) => {
                const { categories, lastFetchedCategories } = get();
                const now = Date.now();
                // 5 minute client cache
                if (!force && categories.length > 0 && (now - lastFetchedCategories < 300000)) {
                    return categories;
                }

                try {
                    set({ loading: categories.length === 0 });
                    const res = await fetch('/api/categories');
                    if (res.ok) {
                        const data = await res.json();
                        set({ categories: data.categories || [], lastFetchedCategories: now, loading: false });
                        return data.categories;
                    }
                } catch (e) {
                    console.error('Error fetching categories:', e);
                } finally {
                    set({ loading: false });
                }
                return categories;
            },

            fetchProducts: async (params = {}, force = false) => {
                const { products, lastFetchedProducts } = get();
                const now = Date.now();

                // If default list requested and we have cached products, return immediately
                const isDefaultList = !params.category && !params.search && !params.featured;
                if (!force && isDefaultList && products.length > 0 && (now - lastFetchedProducts < 180000)) {
                    return products;
                }

                try {
                    if (isDefaultList && products.length === 0) set({ loading: true });
                    
                    const query = new URLSearchParams(params).toString();
                    const res = await fetch(`/api/products?${query}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (isDefaultList) {
                            set({ products: data.products || [], lastFetchedProducts: now, loading: false });
                        }
                        return data.products || [];
                    }
                } catch (e) {
                    console.error('Error fetching products:', e);
                } finally {
                    set({ loading: false });
                }
                return products;
            }
        }),
        {
            name: 'freshcart-product-cache',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useProductStore;
