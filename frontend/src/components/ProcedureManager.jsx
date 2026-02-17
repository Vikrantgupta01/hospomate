import { useState, useEffect } from 'react';
import api from '../api';

const ProcedureManager = ({ storeId }) => {
    const [procedures, setProcedures] = useState([]);
    const [jobAreas, setJobAreas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProcedure, setEditingProcedure] = useState(null);

    // Form state for creating/editing
    const [formData, setFormData] = useState({
        name: '',
        type: 'OPENING',
        jobAreaId: '',
        cutoffTime: '',
        tasks: []
    });

    useEffect(() => {
        if (storeId) {
            fetchProcedures();
            fetchJobAreas();
        }
    }, [storeId]);

    const fetchProcedures = async () => {
        try {
            const res = await api.get(`/procedures/store/${storeId}`);
            setProcedures(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchJobAreas = async () => {
        try {
            const res = await api.get(`/job-areas/store/${storeId}`);
            setJobAreas(res.data);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this procedure?')) return;
        try {
            await api.delete(`/procedures/${id}`);
            fetchProcedures();
        } catch (err) { console.error(err); }
    };

    const openModal = (proc = null) => {
        if (proc) {
            setEditingProcedure(proc);
            setFormData({
                name: proc.name,
                type: proc.type,
                jobAreaId: proc.jobArea.id,
                cutoffTime: proc.cutoffTime,
                tasks: proc.tasks || []
            });
        } else {
            setEditingProcedure(null);
            setFormData({
                name: '',
                type: 'OPENING',
                jobAreaId: '',
                cutoffTime: '',
                tasks: []
            });
        }
        setIsModalOpen(true);
    };

    const handleTaskChange = (index, field, value) => {
        const newTasks = [...formData.tasks];
        newTasks[index] = { ...newTasks[index], [field]: value };
        setFormData({ ...formData, tasks: newTasks });
    };

    const addTask = () => {
        setFormData({
            ...formData,
            tasks: [...formData.tasks, { description: '', taskType: 'BOOLEAN', isRequired: true, orderIndex: formData.tasks.length }]
        });
    };

    const removeTask = (index) => {
        const newTasks = formData.tasks.filter((_, i) => i !== index);
        setFormData({ ...formData, tasks: newTasks });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.name || !formData.jobAreaId || !formData.cutoffTime) {
            alert("Please fill in all required fields (Name, Job Area, Cutoff Time).");
            return;
        }

        if (formData.tasks.some(t => !t.description)) {
            alert("All tasks must have a description.");
            return;
        }

        const payload = { ...formData, storeId: parseInt(storeId), jobAreaId: parseInt(formData.jobAreaId) };
        try {
            if (editingProcedure) {
                await api.put(`/procedures/${editingProcedure.id}`, payload);
            } else {
                await api.post('/procedures', payload);
            }
            setIsModalOpen(false);
            fetchProcedures();
        } catch (err) {
            console.error(err);
            alert("Failed to save procedure: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <button className="btn btn-primary" onClick={() => openModal()}>+ Create Procedure</button>
            </div>

            <div className="grid-responsive">
                {procedures.map(proc => (
                    <div key={proc.id} className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{proc.name}</h3>
                            <span className={`badge ${proc.type === 'OPENING' ? 'badge-success' : 'badge-primary'}`}>{proc.type}</span>
                        </div>
                        <p className="text-muted">Job Area: {proc.jobArea?.name}</p>
                        <p className="text-muted">Cutoff: {proc.cutoffTime}</p>
                        <p className="text-muted">{proc.tasks?.length || 0} Tasks</p>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => openModal(proc)}>Edit</button>
                            <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(proc.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 99999, alignItems: 'flex-start', paddingTop: '50px' }} onClick={() => setIsModalOpen(false)}>
                    {/* Fixed styling to prevent conflict and ensure visibility */}
                    <div className="modal animate-in" style={{ padding: '2.5rem', maxHeight: '85vh', overflowY: 'auto', maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
                        <h3>{editingProcedure ? 'Edit' : 'Create'} Procedure</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label className="label">Name</label><input className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                            <div className="grid-responsive" style={{ marginTop: 0 }}>
                                <div className="form-group">
                                    <label className="label">Type</label>
                                    <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="OPENING">OPENING</option>
                                        <option value="CLOSING">CLOSING</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Job Area</label>
                                    <select className="input" value={formData.jobAreaId} onChange={e => setFormData({ ...formData, jobAreaId: e.target.value })} required>
                                        <option value="">Select Area</option>
                                        {jobAreas.map(ja => <option key={ja.id} value={ja.id}>{ja.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label className="label">Cutoff Time</label><input className="input" type="time" value={formData.cutoffTime} onChange={e => setFormData({ ...formData, cutoffTime: e.target.value })} required /></div>
                            </div>

                            <h4>Tasks</h4>
                            {formData.tasks.map((task, i) => (
                                <div key={i} style={{ border: '1px solid var(--slate-200)', padding: '1rem', marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }}>
                                    <div className="grid-responsive" style={{ marginTop: 0 }}>
                                        <div className="form-group"><label className="label">Description</label><input className="input" value={task.description} onChange={e => handleTaskChange(i, 'description', e.target.value)} required /></div>
                                        <div className="form-group">
                                            <label className="label">Type</label>
                                            <select className="input" value={task.taskType} onChange={e => handleTaskChange(i, 'taskType', e.target.value)}>
                                                <option value="BOOLEAN">Checkbox</option>
                                                <option value="PHOTO">Photo</option>
                                                <option value="COMMENT">Comment</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input type="checkbox" checked={task.isRequired} onChange={e => handleTaskChange(i, 'isRequired', e.target.checked)} /> Required
                                        </label>
                                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removeTask(i)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addTask} style={{ marginBottom: '2rem' }}>+ Add Task</button>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>Save</button>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcedureManager;
