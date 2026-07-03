const getRedirectPath = (role, token) => {
    if (!token) return '/login';
    return role === 'admin' ? '/admin/dashboard' : '/menu';
};

describe('Security Route Redirection', () => {
    test('should redirect to login if no token exists', () => {
        expect(getRedirectPath('admin', null)).toBe('/login');
    });

    test('should send admin to dashboard', () => {
        expect(getRedirectPath('admin', 'valid-token')).toBe('/admin/dashboard');
    });

    test('should send student to menu', () => {
        expect(getRedirectPath('student', 'valid-token')).toBe('/menu');
    });
});