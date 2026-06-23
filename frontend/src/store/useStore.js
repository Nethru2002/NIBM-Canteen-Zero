import { create } from 'zustand';

export const useStore = create((set) => ({
    user: {
        name: localStorage.getItem('userName') || null,
        role: localStorage.getItem('userRole') || null,
        token: localStorage.getItem('token') || null,
    },
    
    cart: [],

    setUser: (userData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRole', userData.role);
        set({ user: userData });
    },

    logout: () => {
        localStorage.clear();
        set({ user: { name: null, role: null, token: null }, cart: [] });
        window.location.href = '/login';
    },

    addToCart: (product) => set((state) => ({ 
        cart: [...state.cart, product] 
    })),
}));