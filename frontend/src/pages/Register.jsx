import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CUSTOMER');
    const [storeName, setStoreName] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register({ email, password, role, storeName: role === 'STORE_OWNER' ? storeName : null });
        if (result.success) {
            if (result.data?.role === 'STORE_OWNER') {
                navigate('/dashboard');
            } else if (result.data?.role === 'STAFF') {
                navigate('/staff');
            } else {
                navigate('/');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-card animate-in">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✨</div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Get Started</h1>
                    <p className="text-muted">Create your HospoMate account today.</p>
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500, border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" />
                    </div>
                    <div className="form-group">
                        <label className="label">Password</label>
                        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                    </div>
                    <div className="form-group">
                        <label className="label">Account Type</label>
                        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="CUSTOMER">Customer (Order Food)</option>
                            <option value="STORE_OWNER">Store Owner (Manage Shop)</option>
                            <option value="STAFF">Staff (Clock In/Out)</option>
                        </select>
                    </div>
                    {role === 'STORE_OWNER' && (
                        <div className="form-group animate-in">
                            <label className="label">Business Name</label>
                            <input className="input" type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} required placeholder="e.g. The Coffee House" />
                        </div>
                    )}
                    <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem', height: '3rem' }}>
                        Create My Account
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
