import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [shifts, setShifts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'STAFF') {
            navigate('/login');
            return;
        }
        fetchShifts();
    }, [user]);

    const fetchShifts = async () => {
        // Basic implementation: fetch all shifts for this staff (backend endpoint implementation pending user-link update)
        // For now assuming we can at least render the page
        try {
            // We need a way to get staff ID from user ID or assume it's same or stored in user object
            // The current AuthResponse has storeId but not staffId.
            // We'll skip fetch for now and just show Clock functionality
        } catch (err) {
            console.log(err);
        }
    };

    const handleClockIn = () => {
        alert("Clock In functionality requires Shift ID assignment (Admin Roster). Not implemented in prototype.");
    };

    const handleClockOut = () => {
        alert("Clock Out functionality requires Shift ID assignment (Admin Roster). Not implemented in prototype.");
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container animate-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>👨‍🍳</span>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Staff Portal</h1>
                </div>
                <button onClick={logout} className="btn-logout" style={{ fontWeight: 600 }}>Log Out</button>
            </header>

            <div style={{ padding: '3rem 0' }}>
                <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', fontWeight: 800 }}>
                        {user.email.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome, {user.email.split('@')[0]}</h2>
                    <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '3rem' }}>Ready for your shift? Track your hours with precision.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <button
                            className="btn btn-primary"
                            style={{ height: '4rem', fontSize: '1.25rem', fontWeight: 700, borderRadius: 'var(--radius-lg)' }}
                            onClick={handleClockIn}
                        >
                            🚀 Clock In
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ height: '4rem', fontSize: '1.25rem', fontWeight: 700, borderRadius: 'var(--radius-lg)' }}
                            onClick={handleClockOut}
                        >
                            🛑 Clock Out
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ height: '4rem', fontSize: '1.25rem', fontWeight: 700, borderRadius: 'var(--radius-lg)', gridColumn: '1 / -1', background: 'var(--slate-800)', color: 'white' }}
                            onClick={() => navigate('/staff/procedures')}
                        >
                            📋 Opening & Closing Procedures
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '4rem' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Upcoming Schedule</h3>
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p className="text-muted">No shifts currently scheduled for you. Check back later!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
