import { render, screen } from '@testing-library/react';
import LoginForm from './LoginForm';

describe('LoginForm Unit', () => {
    test('should display email and password fields', () => {
        render(<LoginForm onLogin={() => {}} error="" loading={false} />);
        expect(screen.getByPlaceholderText(/student_id@nibm.lk/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    });
});