const calculateTotal = (cart) => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

const updateItemQuantity = (cart, id, amount) => {
    return cart.map(item =>
        item._id === id ? { ...item, quantity: Math.max(1, Math.min(10, item.quantity + amount)) } : item
    );
};

const removeItem = (cart, id) => {
    return cart.filter(item => item._id !== id);
};

test('should return 0 for an empty cart', () => {
    const cart = [];
    expect(calculateTotal(cart)).toBe(0);
});

test('should calculate total correctly for multiple items', () => {
    const cart = [
        { _id: '1', name: 'Chicken Bun', price: 140, quantity: 2 },
        { _id: '2', name: 'Ginger Tea', price: 80, quantity: 1 }
    ];
    expect(calculateTotal(cart)).toBe(360);
});

test('should correctly update quantity and recalculate total', () => {
    let cart = [{ _id: '1', name: 'Chicken Bun', price: 140, quantity: 1 }];
    
    cart = updateItemQuantity(cart, '1', 1);
    expect(cart[0].quantity).toBe(2);
    expect(calculateTotal(cart)).toBe(280);
});

test('should enforce minimum quantity of 1', () => {
    let cart = [{ _id: '1', name: 'Chicken Bun', price: 140, quantity: 1 }];
    
    cart = updateItemQuantity(cart, '1', -1);
    expect(cart[0].quantity).toBe(1);
});

test('should remove item and update total', () => {
    let cart = [
        { _id: '1', name: 'Chicken Bun', price: 140, quantity: 1 },
        { _id: '2', name: 'Ginger Tea', price: 80, quantity: 1 }
    ];
    
    cart = removeItem(cart, '1');
    expect(cart.length).toBe(1);
    expect(cart[0]._id).toBe('2');
    expect(calculateTotal(cart)).toBe(80);
});