const calculateTotal = (cart) => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

test('calculates cart total correctly with multiple items', () => {
    const mockCart = [
        { name: 'Chicken Bun', price: 140, quantity: 2 },
        { name: 'Ginger Tea', price: 80, quantity: 1 }
    ];
    expect(calculateTotal(mockCart)).toBe(360);
});

test('returns zero for empty cart', () => {
    expect(calculateTotal([])).toBe(0);
});