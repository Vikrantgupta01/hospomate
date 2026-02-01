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
            <div className="container">
                <h2>Your Cart is Empty</h2>
                <Link to="/" className="btn btn-sm" style={{ marginTop: '1rem' }}>Browse Stores</Link>
            </div>
        );
    }

    return (
        <div className="container">
            <h2>Your Cart</h2>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                        <div>
                            <h3>{item.name}</h3>
                            <p>Quantity: {item.quantity}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p>${(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(item.id)} className="btn-logout" style={{ border: 'none', background: 'transparent' }}>Remove Item</button>
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <h3>Total: ${cartTotal.toFixed(2)}</h3>
                    <button className="btn btn-block" onClick={handleCheckout} disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Processing...' : 'Checkout Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
