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
        <div className="auth-container fade-in">
            <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>HospoMate</h1>
            <h2>Create Account</h2>
            {error && <p style={{ color: '#ef4444', background: '#fee2e2', padding: '0.5rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <div className="form-group">
                    <label>I am a...</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="CUSTOMER">Customer</option>
                        <option value="STORE_OWNER">Store Owner</option>
                        <option value="STAFF">Staff Member</option>
                    </select>
                </div>
                {role === 'STORE_OWNER' && (
                    <div className="form-group">
                        <label>Store Name</label>
                        <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} required placeholder="My Awesome Cafe" />
                    </div>
                )}
                <button type="submit" className="btn" style={{ marginTop: '1rem' }}>Register</button>
            </form>
            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748B' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Login here</Link>
            </p>
        </div>
    );
};

export default Register;
