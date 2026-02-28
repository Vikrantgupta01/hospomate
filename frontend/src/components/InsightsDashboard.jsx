import React, { useState, useEffect } from 'react';

const InsightsDashboard = ({ storeId }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [weekStart, setWeekStart] = useState('');
    const [weekInput, setWeekInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Hardcode the buckets to match the Backend's 6:00 -> 15:00 outputs
    const timeBuckets = [
        "6:00", "7:00", "8:00", "9:00", "10:00",
        "11:00", "12:00", "13:00", "14:00"
    ];

    const getIsoWeekNumber = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return { year: d.getUTCFullYear(), week: weekNo };
    };

    const getWeekString = (date) => {
        const { year, week } = getIsoWeekNumber(date);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const today = new Date();
        // Go back up to 6 days to find the current week's Monday
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));

        setWeekStart(monday.toISOString().split('T')[0]);
        setWeekInput(getWeekString(monday));
    }, []);

    const handleWeekChange = (e) => {
        const val = e.target.value;
        setWeekInput(val);
        if (!val) return;

        const [y, w] = val.split('-W');
        const year = parseInt(y, 10);
        const week = parseInt(w, 10);
        const d = new Date(year, 0, 1);
        const dayOffset = d.getDay() <= 4 ? d.getDay() - 1 : d.getDay() - 8;
        d.setDate(d.getDate() - dayOffset + (week - 1) * 7);

        // This calculates the monday string (e.g. 2026-02-23)
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setWeekStart(`${yyyy}-${mm}-${dd}`);
    };

    useEffect(() => {
        if (weekStart && storeId) {
            fetchInsights();
        }
        // eslint-disable-next-line
    }, [weekStart, storeId]);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/insights/weekly/${storeId}?weekStart=${weekStart}`);
            if (res.ok) {
                setDashboardData(await res.json());
            }
        } catch (error) {
            console.error('Error fetching weekly insights', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading Intelligence Data...</div>;
    if (!dashboardData) return <div>No data available</div>;

    const { totalRevenue, revenueByCategory, hourlyInsights, revenueByJobTitle, revenueByStaffName } = dashboardData;

    const getHeatmapColor = (isUnderutilised, rawRevenue) => {
        if (isUnderutilised) return '#fee2e2'; // red background bg-red-100
        if (rawRevenue > 0) return '#dcfce7'; // green background bg-green-100
        return 'var(--white)'; // neutral
    };

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    return (
        <div className="animate-in" style={{ padding: '20px', maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0 }}>Staff-to-Revenue Intelligence</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label className="label" style={{ marginBottom: 0, color: 'var(--slate-600)' }}>Select Week:</label>
                    <input
                        type="week"
                        value={weekInput}
                        onChange={handleWeekChange}
                        className="input"
                        style={{ width: 'auto' }}
                    />
                </div>
            </div>

            <div className="grid-responsive" style={{ marginBottom: '32px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '8px', color: 'var(--slate-500)', fontSize: '1rem', fontWeight: 600 }}>Weekly Revenue</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--slate-900)' }}>
                        ${totalRevenue?.toFixed(2) || '0.00'}
                    </p>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px', color: 'var(--slate-500)', fontSize: '1rem', fontWeight: 600 }}>Top Sales Categories</h3>
                    {revenueByCategory && Object.keys(revenueByCategory).length > 0 ? Object.entries(revenueByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, rev]) => (
                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--slate-100)' }}>
                            <span style={{ fontWeight: 500, color: 'var(--slate-700)' }}>{cat}</span>
                            <strong style={{ color: 'var(--slate-900)' }}>${rev.toFixed(2)}</strong>
                        </div>
                    )) : <p className="text-muted">No category data</p>}
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px', color: 'var(--slate-500)', fontSize: '1rem', fontWeight: 600 }}>Revenue By Job Title</h3>
                    {revenueByJobTitle && Object.keys(revenueByJobTitle).length > 0 ? Object.entries(revenueByJobTitle).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([title, rev]) => (
                        <div key={title} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--slate-100)' }}>
                            <span style={{ fontWeight: 500, color: 'var(--slate-700)' }}>{title}</span>
                            <strong style={{ color: 'var(--slate-900)' }}>${rev.toFixed(2)}</strong>
                        </div>
                    )) : <p className="text-muted">No job title data</p>}
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px', color: 'var(--slate-500)', fontSize: '1rem', fontWeight: 600 }}>Top Staff Contributors</h3>
                    {revenueByStaffName && Object.keys(revenueByStaffName).length > 0 ? Object.entries(revenueByStaffName).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([staff, rev]) => (
                        <div key={staff} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--slate-100)' }}>
                            <span style={{ fontWeight: 500, color: 'var(--slate-700)' }}>{staff}</span>
                            <strong style={{ color: 'var(--slate-900)' }}>${rev.toFixed(2)}</strong>
                        </div>
                    )) : <p className="text-muted">No staff data</p>}
                </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '8px' }}>Staff Utilisation Heatmap</h3>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#fee2e2' }}></div> Underutilised
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#dcfce7' }}></div> Performing
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', border: '1px solid var(--slate-200)' }}></div> No Data
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '800px' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid var(--slate-200)', padding: '12px', width: '100px', backgroundColor: 'var(--slate-50)', color: 'var(--slate-700)' }}>Day \ Time</th>
                                {timeBuckets.map((time) => (
                                    <th key={time} style={{ border: '1px solid var(--slate-200)', padding: '12px', backgroundColor: 'var(--slate-50)', color: 'var(--slate-700)', fontSize: '0.9rem' }}>{time}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {days.map((day, dIdx) => (
                                <tr key={day}>
                                    <td style={{ border: '1px solid var(--slate-200)', padding: '12px', fontWeight: 'bold', color: 'var(--slate-800)', fontSize: '0.85rem' }}>{day.substring(0, 3)}</td>
                                    {timeBuckets.map((time, hIdx) => {
                                        const expectedHour = parseInt(time.split(':')[0], 10);

                                        // Find insight
                                        let hData = hourlyInsights?.find(hi => {
                                            const date = new Date(hi.startTime);
                                            // JS getDay() is 0=Sun, 1=Mon... Our dIdx is 0=Mon, 1=Tue...
                                            const jsDay = date.getDay();
                                            const adjustedArrayDay = jsDay === 0 ? 6 : jsDay - 1;

                                            // Ensure the bucket completely matches the exact local hour.
                                            return adjustedArrayDay === dIdx && date.getHours() === expectedHour;
                                        });

                                        return (
                                            <td key={hIdx} style={{
                                                border: '1px solid var(--slate-200)',
                                                padding: '12px 8px',
                                                background: getHeatmapColor(hData?.underutilised, hData?.totalRevenue),
                                                transition: 'all 0.2s',
                                                height: '60px'
                                            }}>
                                                <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.95rem' }}>
                                                    ${hData?.totalRevenue?.toFixed(0) || 0}
                                                </div>
                                                <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>
                                                    {hData?.activeStaffCount || 0} Staff
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default InsightsDashboard;
