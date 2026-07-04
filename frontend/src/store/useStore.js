import { create } from 'zustand';

export const useStore = create((set) => ({
    user: {
        name: localStorage.getItem('userName') || null,
        role: localStorage.getItem('userRole') || null,
        token: localStorage.getItem('token') || null,
    },
    pendingOrderCount: 0,
    setUser: (userData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRole', userData.role);
        set({ user: userData });
    },
    setPendingOrderCount: (count) => set({ pendingOrderCount: count }),
    logout: () => {
        localStorage.clear();
        set({ user: { name: null, role: null, token: null }, pendingOrderCount: 0 });
        window.location.href = '/login';
    }
}));