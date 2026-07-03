import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

describe('Authentication Gateway', () => {
    test('should render portal branding and login form', () => {
        render(<BrowserRouter><Login /></BrowserRouter>);
        expect(screen.getByText(/CANTEEN-ZERO/i)).toBeInTheDocument();
        expect(screen.getByText(/Student Login/i)).toBeInTheDocument();
    });
});