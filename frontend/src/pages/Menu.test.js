import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Menu from './Menu';
import API from '../services/api';
import '@testing-library/jest-dom';

jest.mock('../services/api');

const mockProducts = [
    { _id: '1', name: 'Chicken Bun', price: 140, category: 'Snacks', isAvailable: true, prepTime: 2 },
];

describe('Student Menu Dashboard', () => {
    beforeEach(() => {
        API.get.mockResolvedValue({ data: mockProducts });
    });

    test('renders academic selection header', async () => {
        render(<BrowserRouter><Menu /></BrowserRouter>);
        
        await waitFor(() => {
            expect(screen.getByText(/Academic Selection/i)).toBeInTheDocument();
        });
    });

    test('renders category filters correctly', async () => {
        render(<BrowserRouter><Menu /></BrowserRouter>);
        
        await waitFor(() => {
            expect(screen.getByText(/Snacks/i)).toBeInTheDocument();
            expect(screen.getByText(/Beverages/i)).toBeInTheDocument();
        });
    });
});