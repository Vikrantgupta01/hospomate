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
        <div className="container animate-in">
            <div style={{ padding: '2rem 0' }}>
                <Link to="/" className="btn btn-secondary btn-sm btn-pill" style={{ textDecoration: 'none' }}>
                    &larr; Back to all stores
                </Link>
            </div>

            <div className="card" style={{ marginBottom: '3rem', overflow: 'hidden' }}>
                <div style={{
                    height: '250px',
                    background: store.imageUrl ? `url(${store.imageUrl}) center/cover` : 'var(--primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '3rem',
                    position: 'relative'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{store.name}</h1>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>📍 {store.address}</p>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                Explore the Menu
                <span className="badge badge-primary">{menu.length} items</span>
            </h2>

            <div className="grid-responsive" style={{ marginBottom: '4rem' }}>
                {menu.map(item => (
                    <div key={item.id} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0 }}>{item.name}</h3>
                                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--secondary)' }}>${item.price.toFixed(2)}</span>
                            </div>
                            <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>{item.description}</p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {item.available ? (
                                <>
                                    <span className="badge badge-success">Available</span>
                                    <button className="btn btn-primary btn-sm btn-pill" style={{ padding: '0.6rem 1.5rem' }} onClick={() => addToCart(item, store.id)}>
                                        Add to Cart +
                                    </button>
                                </>
                            ) : (
                                <span className="badge badge-warning">Currently Sold Out</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoreMenu;
