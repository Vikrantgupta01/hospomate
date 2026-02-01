import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const StoreList = () => {
    const [stores, setStores] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async (query = '') => {
        try {
            const url = query ? `/stores/search?query=${query}` : '/stores';
            const res = await api.get(url);
            setStores(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchStores(search);
    };

    return (
        <div className="container animate-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>🍴</span>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>HospoMate</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/cart" className="btn btn-secondary btn-sm btn-pill" style={{ textDecoration: 'none' }}>
                        Cart 🛒
                    </Link>
                    <Link to="/login" className="btn btn-primary btn-sm btn-pill" style={{ textDecoration: 'none' }}>
                        Partner Login
                    </Link>
                </div>
            </header>

            <section style={{ padding: '6rem 0', textAlign: 'center' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                    Savor the <span style={{ color: 'var(--primary)' }}>Local</span> Flavor.
                </h1>
                <p style={{ color: 'var(--slate-500)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                    Connecting you with the finest culinary experiences in your neighborhood. Fresh, fast, and local.
                </p>
                <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            className="input"
                            type="text"
                            placeholder="Find a store, cafe or restaurant..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ height: '3.5rem', paddingLeft: '1.5rem', fontSize: '1.1rem', borderRadius: '999px' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-pill" style={{ height: '3.5rem', padding: '0 2.5rem', fontWeight: 700 }}>
                        Search
                    </button>
                </form>
            </section>

            <div className="grid-responsive" style={{ marginBottom: '6rem' }}>
                {stores.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                        <p className="text-muted" style={{ fontSize: '1.2rem' }}>No stores found. Try a different search!</p>
                    </div>
                ) : stores.map(store => (
                    <div key={store.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{
                            height: '200px',
                            background: store.imageUrl ? `url(${store.imageUrl}) center/cover` : 'var(--slate-100)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            {!store.imageUrl && <span style={{ color: 'var(--slate-400)', fontSize: '2rem' }}>🍕</span>}
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                <span className="badge badge-success">Open</span>
                            </div>
                        </div>
                        <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{store.name}</h3>
                            <p className="text-muted" style={{ marginBottom: '2rem', flex: 1, fontSize: '0.95rem' }}>{store.address}</p>
                            <Link to={`/store/${store.id}`} className="btn btn-secondary btn-block" style={{ textDecoration: 'none', fontWeight: 600 }}>
                                Browse Menu
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--slate-100)', textAlign: 'center' }}>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    © 2024 HospoMate. All rights reserved. Professional Hospitality Management.
                </p>
            </footer>
        </div>
    );
};

export default StoreList;
