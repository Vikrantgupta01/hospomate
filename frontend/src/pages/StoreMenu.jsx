import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';

const StoreMenu = () => {
    const { id } = useParams();
    const [store, setStore] = useState(null);
    const [menu, setMenu] = useState([]);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storeRes = await api.get(`/stores/${id}`);
                setStore(storeRes.data);
                const menuRes = await api.get(`/stores/${id}/menu`);
                setMenu(menuRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    if (!store) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <Link to="/" className="btn-secondary btn-sm btn-pill" style={{ margin: '1.5rem 0' }}>&larr; Back to Stores</Link>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h1>{store.name}</h1>
                <p>{store.address}</p>
            </div>

            <h2>Menu</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                {menu.map(item => (
                    <div key={item.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3>{item.name}</h3>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>{item.description}</p>
                            <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>${item.price.toFixed(2)}</p>
                        </div>
                        {item.available ? (
                            <button className="btn btn-sm btn-pill" style={{ padding: '0.5rem 1.25rem' }} onClick={() => addToCart(item, store.id)}>
                                Add to Cart
                            </button>
                        ) : (
                            <span style={{ color: 'red', fontSize: '0.9rem' }}>Sold Out</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoreMenu;
