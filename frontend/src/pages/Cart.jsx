import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
    const { cart, removeFromCart, clearCart, cartTotal, storeId } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const orderRequest = {
                storeId: storeId,
                customerId: user.id,
                items: cart.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity
                })),
                pickupTime: new Date(Date.now() + 30 * 60000) // Mock: 30 mins from now
            };

            const res = await api.post('/orders', orderRequest);
            if (res.status === 200) {
                clearCart();
                alert('Order placed successfully!');
                navigate('/'); // Or order status page
            }
        } catch (err) {
            console.error(err);
            alert('Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container animate-in">
                <div className="card" style={{ padding: '5rem', textAlign: 'center', marginTop: '4rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🛒</div>
                    <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
                    <p className="text-muted" style={{ marginBottom: '2.5rem' }}>Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/" className="btn btn-primary btn-pill" style={{ textDecoration: 'none', padding: '1rem 3rem' }}>
                        Browse Local Stores
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-in">
            <div style={{ padding: '3rem 0' }}>
                <Link to="/" className="btn btn-secondary btn-sm btn-pill" style={{ textDecoration: 'none' }}>
                    &larr; Continue Shopping
                </Link>
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '2.5rem' }}>Your Selection</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    {cart.map((item, index) => (
                        <div key={item.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '1.5rem 0',
                            borderBottom: index === cart.length - 1 ? 'none' : '1px solid var(--slate-100)'
                        }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary)' }}>
                                    {item.quantity}x
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h3>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Unit Price: ${item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>${(item.price * item.quantity).toFixed(2)}</p>
                                <button onClick={() => removeFromCart(item.id)} className="btn-logout" style={{ fontSize: '0.85rem' }}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card" style={{ padding: '2rem', background: 'var(--secondary)', color: 'white' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', opacity: 0.8 }}>
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800 }}>
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                        className="btn btn-primary btn-block"
                        onClick={handleCheckout}
                        disabled={loading}
                        style={{ height: '3.5rem', fontSize: '1.1rem' }}
                    >
                        {loading ? 'Processing...' : 'Place Order Now'}
                    </button>

                    <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', textAlign: 'center', opacity: 0.6 }}>
                        Secure checkout powered by HospoMate
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Cart;
