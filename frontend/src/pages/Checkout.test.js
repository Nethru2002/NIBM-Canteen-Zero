import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Checkout from './Checkout';
import '@testing-library/jest-dom';

describe('Payment Gateway Interface', () => {
    test('renders LANKAQR scan instructions', () => {
        render(<BrowserRouter><Checkout /></BrowserRouter>);
        
        expect(screen.getByText(/Scan with Banking App/i)).toBeInTheDocument();
        
        expect(screen.getByText(/PCI-DSS/i)).toBeInTheDocument();
    });
});