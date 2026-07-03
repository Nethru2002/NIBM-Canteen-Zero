import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import KitchenMonitor from './KitchenMonitor';

describe('Industrial Kitchen Monitor', () => {
    test('renders production queue header', () => {
        render(<BrowserRouter><KitchenMonitor /></BrowserRouter>);
        expect(screen.getByText(/Kitchen Monitor/i)).toBeInTheDocument();
        expect(screen.getByText(/Production Queue/i)).toBeInTheDocument();
    });
});