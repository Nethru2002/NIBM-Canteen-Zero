import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import { useCartStore } from '../store/useCartStore';

const renderDrawer = () => render(
    <BrowserRouter>
        <CartDrawer />
    </BrowserRouter>
);

describe('CartDrawer UI', () => {
    test('should show empty state message', () => {
        useCartStore.setState({ isCartOpen: true, cart: [] });
        renderDrawer();
        expect(screen.getByText(/Basket is empty/i)).toBeInTheDocument();
    });

    test('should render items when cart is not empty', () => {
        useCartStore.setState({ 
            isCartOpen: true, 
            cart: [{ _id: '1', name: 'Chicken Bun', price: 140, quantity: 1 }] 
        });
        renderDrawer();
        expect(screen.getByText('Chicken Bun')).toBeInTheDocument();
        const priceElements = screen.getAllByText(/140/i);
        expect(priceElements.length).toBeGreaterThan(0);
    });
});