import { useStore } from './useStore';

describe('Global User Identity Store', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should initialize with empty user state', () => {
        const state = useStore.getState();
        expect(state.user.name).toBeNull();
    });

    test('setUser should update state and storage', () => {
        const mockUser = { name: 'Nethru', role: 'student', token: 'jwt123' };
        useStore.getState().setUser(mockUser);
        expect(useStore.getState().user.name).toBe('Nethru');
        expect(localStorage.getItem('userName')).toBe('Nethru');
    });
});