import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [storeId, setStoreId] = useState(null);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        const storedStoreId = localStorage.getItem('cartStoreId');
        if (storedCart) setCart(JSON.parse(storedCart));
        if (storedStoreId) setStoreId(JSON.parse(storedStoreId));
    }, []);

    const addToCart = (item, storeIdParam) => {
        // If adding item from a different store, confirm clear
        if (storeId && storeId !== storeIdParam && cart.length > 0) {
            if (!window.confirm("Start a new order? This will clear your current cart from another store.")) {
                return;
            }
            clearCart();
        }

        setStoreId(storeIdParam);
        localStorage.setItem('cartStoreId', JSON.stringify(storeIdParam));

        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            let newCart;
            if (existing) {
                newCart = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            } else {
                newCart = [...prev, { ...item, quantity: 1 }];
            }
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => {
            const newCart = prev.filter(i => i.id !== itemId);
            localStorage.setItem('cart', JSON.stringify(newCart));
            if (newCart.length === 0) {
                setStoreId(null);
                localStorage.removeItem('cartStoreId');
            }
            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
        setStoreId(null);
        localStorage.removeItem('cart');
        localStorage.removeItem('cartStoreId');
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, storeId, addToCart, removeFromCart, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};
