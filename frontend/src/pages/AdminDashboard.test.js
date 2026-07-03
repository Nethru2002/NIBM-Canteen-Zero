import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import API from '../services/api';
import '@testing-library/jest-dom';

jest.mock('../services/api');

describe('Admin Dashboard UI States', () => {
    beforeEach(() => {
        API.get.mockResolvedValue({ data: [] });
        API.patch.mockResolvedValue({ data: {} });
        API.post.mockResolvedValue({ data: {} });
    });

    test('should render the Inventory Manager and Catalog Entry sections', async () => {
        render(<BrowserRouter><AdminDashboard /></BrowserRouter>);
        
        await waitFor(() => {
            expect(screen.getByText(/Inventory Manager/i)).toBeInTheDocument();
            expect(screen.getByText(/Catalog Entry/i)).toBeInTheDocument();
        });
    });

    test('should show the global reset button', async () => {
        render(<BrowserRouter><AdminDashboard /></BrowserRouter>);
        
        await waitFor(() => {
            expect(screen.getByText(/Global Reset/i)).toBeInTheDocument();
        });
    });
});