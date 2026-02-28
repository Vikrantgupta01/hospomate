import React, { useState, useEffect } from 'react';

const IntelligenceSettings = ({ storeId }) => {
    const [contributions, setContributions] = useState([]);

    // Forms
    const [newRoleTitle, setNewRoleTitle] = useState('');
    const [newRoleCategory, setNewRoleCategory] = useState('');
    const [newRolePercentage, setNewRolePercentage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [squareCategories, setSquareCategories] = useState([]);
    const [staffJobRoles, setStaffJobRoles] = useState([]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [storeId]);

    const fetchData = async () => {
        try {
            const contRes = await fetch(`/api/admin/config/contributions/${storeId}`);
            if (contRes.ok) setContributions(await contRes.json());

            const sqCatRes = await fetch(`/api/admin/config/square-categories`);
            if (sqCatRes.ok) setSquareCategories(await sqCatRes.json());

            const rolesRes = await fetch(`/api/admin/config/job-roles/${storeId}`);
            if (rolesRes.ok) setStaffJobRoles(await rolesRes.json());
        } catch (error) {
            console.error('Error fetching intelligence config:', error);
            setErrorMessage('Failed to fetch intelligence configs.');
        }
    };

    const handleAddContribution = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const res = await fetch(`/api/admin/config/contributions/${storeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobTitle: newRoleTitle,
                    categoryName: newRoleCategory,
                    contributionPercentage: parseFloat(newRolePercentage)
                })
            });
            if (res.ok) {
                setNewRoleTitle('');
                setNewRoleCategory('');
                setNewRolePercentage('');
                fetchData();
            } else {
                setErrorMessage('Failed to add mapping. Check backend logs for constraints.');
            }
        } catch (error) {
            console.error('Error adding contribution:', error);
            setErrorMessage('Error communicating with the server.');
        }
    };

    const handleDeleteContribution = async (id) => {
        setErrorMessage('');
        try {
            const res = await fetch(`/api/admin/config/contributions/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchData();
            } else {
                setErrorMessage('Failed to delete mapping.');
            }
        } catch (error) {
            console.error('Error deleting contribution:', error);
            setErrorMessage('Error communicating with the server.');
        }
    };

    return (
        <div className="animate-in" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px' }}>Intelligence Engine Settings</h2>

            {errorMessage && (
                <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '20px' }}>
                    <strong>Error:</strong> {errorMessage}
                </div>
            )}

            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Job Role Contributions</h3>
                <p className="text-muted" style={{ marginBottom: '24px' }}>
                    Map your Square job roles directly to specific sales categories to precisely distribute revenue in the insights heatmap.
                </p>

                <form onSubmit={handleAddContribution} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="label">Staff Role</label>
                        <select
                            value={newRoleTitle}
                            onChange={(e) => setNewRoleTitle(e.target.value)}
                            required
                            className="input"
                        >
                            <option value="">Select Staff Role</option>
                            {staffJobRoles.map((role, idx) => (
                                <option key={idx} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="label">Sales Category</label>
                        <select
                            value={newRoleCategory}
                            onChange={(e) => setNewRoleCategory(e.target.value)}
                            required
                            className="input"
                        >
                            <option value="">Select Category</option>
                            {squareCategories.map((sqCat, idx) => (
                                <option key={idx} value={sqCat}>{sqCat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="label">Contribution %</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="number"
                                placeholder="e.g. 50"
                                value={newRolePercentage}
                                onChange={(e) => setNewRolePercentage(e.target.value)}
                                required
                                className="input"
                                min="1" max="100"
                            />
                            <span style={{ fontWeight: '500', color: 'var(--slate-500)' }}>%</span>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ height: '48px' }}>
                        Add Mapping
                    </button>
                </form>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--slate-50)' }}>
                                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--slate-600)', borderBottom: '1px solid var(--slate-200)' }}>Job Title</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--slate-600)', borderBottom: '1px solid var(--slate-200)' }}>Sales Category</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--slate-600)', borderBottom: '1px solid var(--slate-200)' }}>Contribution %</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--slate-600)', borderBottom: '1px solid var(--slate-200)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contributions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--slate-500)' }}>
                                        No mappings added yet. Add your first mapping above.
                                    </td>
                                </tr>
                            ) : (
                                contributions.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                                        <td style={{ padding: '16px' }}>{c.jobTitle}</td>
                                        <td style={{ padding: '16px' }}><span className="badge badge-primary">{c.categoryName}</span></td>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{c.contributionPercentage}%</td>
                                        <td style={{ padding: '16px' }}>
                                            <button onClick={() => handleDeleteContribution(c.id)} className="btn btn-danger btn-sm">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IntelligenceSettings;
