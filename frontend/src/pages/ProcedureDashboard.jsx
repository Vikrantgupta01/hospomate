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
            // If STORE_OWNER, fetch all procedures for the store
            if (user.role === 'STORE_OWNER') {
                const res = await api.get(`/procedures/store/${user.storeId}`);
                setProcedures(res.data);
                setLoading(false);
                return;
            }

            // Otherwise, find the staff record for this user
            const staffRes = await api.get(`/staff/store/${user.storeId}`);
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
