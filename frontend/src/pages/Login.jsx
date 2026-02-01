import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
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
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍴</div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>HospoMate</h1>
                    <p className="text-muted">Welcome back! Please enter your details.</p>
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

                    <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem', height: '3rem' }}>
                        Sign in to Dashboard
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
                    <span className="text-muted">Don't have an account? </span>
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
