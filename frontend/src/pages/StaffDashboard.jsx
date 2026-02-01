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
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 0' }}>
                <h1 style={{ color: 'var(--secondary-color)' }}>Staff Portal</h1>
                <button onClick={logout} className="btn-logout">Logout</button>
            </header>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center', margin: '2rem 0' }}>
                <h2>Welcome, {user.email}</h2>
                <p>Manage your shifts and time.</p>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '2.5rem' }}>
                    <button className="btn btn-success" style={{ width: '200px' }} onClick={handleClockIn}>Clock In</button>
                    <button className="btn btn-danger" style={{ width: '200px' }} onClick={handleClockOut}>Clock Out</button>
                </div>
            </div>

            <h3>My Upcoming Shifts</h3>
            <p>No shifts assigned.</p>
        </div>
    );
};

export default StaffDashboard;
