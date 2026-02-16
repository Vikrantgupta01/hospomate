import React, { useState, useEffect } from 'react';
import api from '../api';

const RosterReport = ({ storeId }) => {

    // Helper to get Monday of current week
    const getMonday = (d) => {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    const [dailySales, setDailySales] = useState({});

    useEffect(() => {
        fetchReport();
    }, [weekStart, storeId]);

    // Reset to page 1 when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [reportData]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const startStr = weekStart.toISOString();
            const endStr = addDays(weekStart, 7).toISOString();
            const res = await api.get(`/shifts/report/${storeId}?start=${startStr}&end=${endStr}`);

            // Handle new response structure: { shifts: [], dailySales: {} }
            if (res.data.shifts && res.data.dailySales) {
                setReportData(res.data.shifts);
                setDailySales(res.data.dailySales);
            } else {
                // Fallback for backward compatibility or if structure matches old array
                setReportData(Array.isArray(res.data) ? res.data : []);
                setDailySales({});
            }
        } catch (err) {
            console.error("Failed to fetch report", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevWeek = () => setWeekStart(addDays(weekStart, -7));
    const handleNextWeek = () => setWeekStart(addDays(weekStart, 7));

    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount || 0);
    };

    // Calculate totals
    const totalScheduledMinutes = reportData.reduce((acc, row) => {
        if (row.scheduledStartTime && row.scheduledEndTime) {
            return acc + (new Date(row.scheduledEndTime) - new Date(row.scheduledStartTime)) / 60000;
        }
        return acc;
    }, 0);

    const totalActualMinutes = reportData.reduce((acc, row) => {
        if (row.actualClockInTime && row.actualClockOutTime) {
            return acc + (new Date(row.actualClockOutTime) - new Date(row.actualClockInTime)) / 60000;
        }
        return acc;
    }, 0);

    const formatDuration = (minutes) => {
        const h = Math.floor(Math.abs(minutes) / 60);
        const m = Math.floor(Math.abs(minutes) % 60);
        return `${minutes < 0 ? '-' : ''}${h}h ${m}m`;
    };

    // Grouping Logic
    const groupedData = React.useMemo(() => {
        console.log("RosterReport: Grouping data...", reportData);
        return reportData.reduce((acc, row) => {
            // Use row.date if available, otherwise derive from actualClockInTime
            let dateKey = row.date;
            if (!dateKey && row.actualClockInTime) {
                dateKey = row.actualClockInTime.split('T')[0];
            }
            if (!dateKey) dateKey = 'Unknown';

            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(row);
            return acc;
        }, {});
    }, [reportData]);

    // Sort dates (descending)
    const sortedDates = React.useMemo(() => {
        return Object.keys(groupedData).sort((a, b) => b.localeCompare(a));
    }, [groupedData]);

    const [expandedDays, setExpandedDays] = useState({});

    useEffect(() => {
        if (sortedDates.length > 0) {
            console.log("RosterReport: Initializing expanded days", sortedDates);
            const initial = {};
            sortedDates.forEach(date => initial[date] = true);
            setExpandedDays(initial);
        }
    }, [sortedDates]); // Depend on sortedDates to ensure update

    const toggleDay = (date) => {
        setExpandedDays(prev => ({ ...prev, [date]: !prev[date] }));
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={handlePrevWeek}>&larr; Prev</button>
                    <h3 style={{ margin: 0 }}>
                        {weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} - {addDays(weekStart, 6).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <button className="btn btn-secondary" onClick={handleNextWeek}>Next &rarr;</button>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div className="card" style={{ padding: '0.5rem 1rem', background: 'var(--slate-50)' }}>
                        <small className="text-muted">Total Scheduled</small>
                        <div style={{ fontWeight: 700 }}>{formatDuration(totalScheduledMinutes)}</div>
                    </div>
                    <div className="card" style={{ padding: '0.5rem 1rem', background: 'var(--slate-50)' }}>
                        <small className="text-muted">Total Actual</small>
                        <div style={{ fontWeight: 700 }}>{formatDuration(totalActualMinutes)}</div>
                    </div>
                    <div className="card" style={{ padding: '0.5rem 1rem', background: 'var(--slate-50)' }}>
                        <small className="text-muted">Variance</small>
                        <div style={{ fontWeight: 700, color: totalActualMinutes - totalScheduledMinutes > 0 ? 'red' : 'green' }}>
                            {formatDuration(totalActualMinutes - totalScheduledMinutes)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {sortedDates.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>No shifts found for this week.</div>
                ) : (
                    sortedDates.map(date => {
                        const dayVariance = groupedData[date].reduce((sum, row) => sum + (row.varianceMinutes || 0), 0);
                        const daySales = dailySales[date] || 0;

                        return (
                            <div key={date} style={{ borderBottom: '1px solid var(--slate-200)' }}>
                                <div
                                    onClick={() => toggleDay(date)}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--slate-50)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '1rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span>{expandedDays[date] ? '▼' : '►'}</span>
                                        <span>{new Date(date).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                        <span style={{ fontWeight: 400, color: 'var(--slate-500)', fontSize: '0.9rem' }}>({groupedData[date].length} shifts)</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                                        <div style={{ color: 'var(--slate-700)' }}>
                                            Sales: <strong>{formatCurrency(daySales)}</strong>
                                        </div>
                                        <div style={{ color: dayVariance > 15 ? 'red' : (dayVariance < -15 ? 'orange' : 'green') }}>
                                            Var: <strong>{formatDuration(dayVariance)}</strong>
                                        </div>
                                    </div>
                                </div>

                                {expandedDays[date] && (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: '#fff', borderBottom: '1px solid var(--slate-100)' }}>
                                            <tr>
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', width: '20%' }}>Staff Name</th>
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '30%' }}>Scheduled</th>
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '30%' }}>Actual</th>
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '20%' }}>Variance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedData[date].map((row, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{row.staffName}</td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                        {row.scheduledStartTime ? (
                                                            <span>{formatTime(row.scheduledStartTime)} - {formatTime(row.scheduledEndTime)}</span>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                        {row.actualClockInTime ? (
                                                            <span style={{ color: 'var(--slate-700)' }}>
                                                                {formatTime(row.actualClockInTime)} - {formatTime(row.actualClockOutTime)}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--danger)', fontStyle: 'italic', fontSize: '0.85rem' }}>Missing Clock-in</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: row.varianceMinutes > 15 ? 'red' : 'green' }}>
                                                        {row.varianceMinutes !== 0 ? `${row.varianceMinutes > 0 ? '+' : ''}${row.varianceMinutes} m` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </div >
    );
};

export default RosterReport;
