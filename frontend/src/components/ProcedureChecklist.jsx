import { useState, useEffect } from 'react';
import api from '../api';

const ProcedureChecklist = ({ procedure, onClose, userId }) => {
    const [execution, setExecution] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        startOrResumeExecution();
    }, [procedure, userId]);

    const startOrResumeExecution = async () => {
        try {
            // Start execution
            const res = await api.post(`/procedures/execute/${procedure.id}/user/${userId}`);
            const executionData = res.data;
            setExecution(executionData);

            // Merge procedure tasks with existing execution status
            const initialTasks = procedure.tasks.map(procTask => {
                // Find matching execution if available
                const existingExec = executionData.taskExecutions?.find(te => te.task.id === procTask.id);
                return {
                    ...procTask,
                    isCompleted: existingExec ? existingExec.completed : false, // Map backend 'completed' to frontend 'isCompleted' if needed, or just use as is
                    comment: existingExec?.comment || '',
                    photoUrl: existingExec?.photoUrl || ''
                };
            });

            setTasks(initialTasks || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleTaskUpdate = async (taskId, updates) => {
        // Update local state immediately for UI responsiveness
        setTasks(prevTasks => prevTasks.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
        ));

        try {
            if (!execution) return;
            await api.post(`/procedures/execute/${execution.id}/task/${taskId}`, updates);
        } catch (err) {
            console.error(err);
            // Revert on error if needed, but for now just log
        }
    };

    const handleSubmit = async () => {
        // Removed window.confirm for smoother UX/Testing
        try {
            await api.post(`/procedures/execute/${execution.id}/complete`);
            alert("Procedure Submitted!");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to submit");
        }
    };

    if (loading) return <div>Loading checklist...</div>;

    return (
        <div className="card animate-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>{procedure.name}</h2>
                <button className="btn-logout" onClick={onClose} style={{ fontSize: '1.5rem', padding: 0 }}>×</button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                {tasks.map(task => (
                    <div key={task.id} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 600 }}>{task.description}</span>
                            {task.isRequired && <span className="badge badge-warning">Required</span>}
                        </div>

                        {task.taskType === 'BOOLEAN' && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '1.1rem' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: '24px', height: '24px' }}
                                    checked={task.isCompleted || false}
                                    onChange={(e) => handleTaskUpdate(task.id, { isCompleted: e.target.checked })}
                                />
                                Mark as Done
                            </label>
                        )}

                        {task.taskType === 'COMMENT' && (
                            <textarea
                                className="input"
                                placeholder="Add comment..."
                                rows="2"
                                value={task.comment || ''}
                                onChange={(e) => handleTaskUpdate(task.id, { isCompleted: true, comment: e.target.value })}
                            />
                        )}

                        {task.taskType === 'PHOTO' && (
                            <div>
                                <input type="file" className="input" style={{ background: 'white' }}
                                    onChange={(e) => {
                                        // In real app, upload to S3/Cloudinary first, then send URL.
                                        // For now, just mark completed.
                                        handleTaskUpdate(task.id, { isCompleted: true, photoUrl: 'uploaded-dummy.jpg' });
                                    }}
                                />
                                {task.isCompleted && <span style={{ color: 'green', fontSize: '0.9rem' }}>✓ Photo Uploaded</span>}
                                <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>* Photo upload simulated</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button className="btn btn-primary btn-block" onClick={handleSubmit} style={{ padding: '1rem', fontSize: '1.1rem' }}>
                ✅ Submit Procedure
            </button>
        </div>
    );
};

export default ProcedureChecklist;
