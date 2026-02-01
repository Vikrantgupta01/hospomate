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
        <div className="container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
                <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>HospoMate</h1>
                <div>
                    <Link to="/cart" className="btn-secondary btn-pill" style={{ marginRight: '0.75rem', padding: '0.6rem 1.25rem' }}>View Cart</Link>
                    <Link to="/login" className="btn btn-pill" style={{ padding: '0.6rem 1.75rem' }}>Login</Link>
                </div>
            </header>

            <div style={{ margin: '4rem 0', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-color)' }}>Find Your Next Meal</h1>
                <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '1.2rem' }}>Discover the best local food around you.</p>
                <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', maxWidth: '500px', margin: '0 auto' }}>
                    <input
                        type="text"
                        placeholder="Search for stores..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: '1rem', flex: 1, borderRadius: 'var(--radius)', border: '1px solid var(--grey-light)', fontSize: '1rem', boxShadow: 'var(--shadow)' }}
                    />
                    <button type="submit" className="btn btn-pill" style={{ padding: '0 2rem' }}>Search</button>
                </form>
            </div>

            <div className="grid-responsive" style={{ marginBottom: '4rem' }}>
                {stores.map(store => (
                    <div key={store.id} style={{ background: 'white', padding: '0', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '150px', background: store.imageUrl ? `url(${store.imageUrl}) center/cover` : 'var(--grey-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!store.imageUrl && <span style={{ color: '#94a3b8' }}>No Image</span>}
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{store.name}</h3>
                            <p style={{ color: '#64748B', marginBottom: '1.5rem', flex: 1 }}>{store.address}</p>
                            <Link to={`/store/${store.id}`} className="btn-secondary btn-block" style={{ textAlign: 'center' }}>View Menu</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoreList;
