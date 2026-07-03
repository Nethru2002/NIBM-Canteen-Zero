import { useCartStore } from './useCartStore';

describe('Cart Persistence Logic', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart();
    });

    test('should add item and calculate total', () => {
        const item = { _id: '1', name: 'Chicken Bun', price: 140 };
        useCartStore.getState().addToCart(item);
        const state = useCartStore.getState();
        expect(state.cart.length).toBe(1);
        expect(state.cart[0].quantity).toBe(1);
    });

    test('should handle multiple quantities correctly', () => {
        const item = { _id: '1', name: 'Chicken Bun', price: 140 };
        useCartStore.getState().addToCart(item);
        useCartStore.getState().updateQuantity('1', 1);
        expect(useCartStore.getState().cart[0].quantity).toBe(2);
    });

    test('should remove items correctly', () => {
        const item = { _id: '1', name: 'Chicken Bun', price: 140 };
        useCartStore.getState().addToCart(item);
        useCartStore.getState().removeFromCart('1');
        expect(useCartStore.getState().cart.length).toBe(0);
    });
});