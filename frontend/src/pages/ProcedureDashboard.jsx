import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import ProcedureChecklist from '../components/ProcedureChecklist';

const ProcedureDashboard = () => {
    const { user } = useContext(AuthContext);
    const [procedures, setProcedures] = useState([]);
    const [selectedProcedure, setSelectedProcedure] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProcedures();
        }
    }, [user]);

    const fetchProcedures = async () => {
        setLoading(true);
        try {
            // Fetch procedures for this staff member
            // Assuming user.staffId exists or we use user.id to find staff
            // The backend endpoint /procedures/staff/{id} uses staffId.
            // We need to know the staffId. 
            // Often AuthContext user object has id, role, storeId, but maybe not staffId unless mapped.
            // Let's assume user.id maps to User entity, and we need to find staff.
            // The backend endpoint /staff/store/{storeId} returns staff list.
            // Or /procedures/my-tasks could have been better. 

            // Workaround: Call an endpoint to get current staff profile or list.
            // Or assume user object has it.
            // Let's try to fetch all procedures for store and filter? No.

            // Let's try using user.id if backend supports it or if we updated Auth response.
            // If not, we might need to fetch staff profile first.

            // A common pattern: GET /staff/me

            // For now, let's assume we can pass user.id to a specialized endpoint or logic.
            // But I implemented /procedures/staff/{staffId}.

            // Let's find the staff record for this user.
            const staffRes = await api.get(`/staff/store/${user.storeId}`);
            // This returns all staff. 
            // user.email matches staff.email or user.id matches staff.user.id
            const currentStaff = staffRes.data.find(s => s.user?.id === user.id || s.email === user.email);

            if (currentStaff) {
                const res = await api.get(`/procedures/staff/${currentStaff.id}`);
                setProcedures(res.data);
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    if (loading) return <div>Loading procedures...</div>;

    if (selectedProcedure) {
        return (
            <ProcedureChecklist
                procedure={selectedProcedure}
                onClose={() => { setSelectedProcedure(null); fetchProcedures(); }}
                userId={user.id}
            />
        );
    }

    return (
        <div className="animate-in" style={{ padding: '1rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>My Procedures</h2>
            <div className="grid-responsive">
                {procedures.length === 0 ? (
                    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="text-muted">No procedures assigned to your role.</p>
                    </div>
                ) : procedures.map(proc => (
                    <div key={proc.id} className="card" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => setSelectedProcedure(proc)}>
                        <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{proc.name}</h3>
                        <p className="text-muted">{proc.type} - Cutoff: {proc.cutoffTime}</p>
                        <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Start Checklist</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProcedureDashboard;
