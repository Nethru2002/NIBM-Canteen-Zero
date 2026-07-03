import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';

describe('Identity Management Page', () => {
    test('should render contact update form', () => {
        render(<BrowserRouter><Profile /></BrowserRouter>);
        expect(screen.getByText(/Identity Settings/i)).toBeInTheDocument();
        expect(screen.getByText(/Contact Number/i)).toBeInTheDocument();
    });
});