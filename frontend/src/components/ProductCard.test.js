import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';
import '@testing-library/jest-dom';

const mockProduct = {
    name: "Fish Pastry",
    price: 130,
    description: "Spicy and flaky",
    category: "Snacks",
    prepTime: 1,
    spiceLevel: 2,
    isVeg: false
};

describe('ProductCard UI Component', () => {
    test('should render product name and price correctly', () => {
        localStorage.setItem('userRole', 'student');
        render(<ProductCard product={mockProduct} index={0} />);
        expect(screen.getByText('Fish Pastry')).toBeInTheDocument();
        expect(screen.getByText(/Rs.130/i)).toBeInTheDocument();
    });

    test('should hide basket button if user is admin', () => {
        localStorage.setItem('userRole', 'admin');
        render(<ProductCard product={mockProduct} index={0} />);
        expect(screen.queryByText(/Add to Basket/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Viewing Mode Only/i)).toBeInTheDocument();
    });
});