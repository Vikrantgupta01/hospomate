import { useState, useEffect } from 'react';
import api from '../api';

const RosterMatrix = ({ storeId, staff, onEditShift, onDeleteShift }) => {
    // Helper to get Monday of current week
    const getMonday = (d) => {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };

    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    useEffect(() => {
        fetchShifts();
    }, [weekStart, storeId]);

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const start = weekStart;
            const end = addDays(weekStart, 7);
            // Send ISO strings
            const startStr = start.toISOString();
            const endStr = end.toISOString();
            const res = await api.get(`/shifts/comparison/${storeId}?start=${startStr}&end=${endStr}`);
            setShifts(res.data);
        } catch (err) {
            console.error("Failed to fetch roster", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevWeek = () => setWeekStart(addDays(weekStart, -7));
    const handleNextWeek = () => setWeekStart(addDays(weekStart, 7));

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const getShiftsForCell = (staffId, date) => {
        return shifts.filter(dto => {
            const s = dto.scheduledShift;
            const sDate = new Date(s.startTime);
            return s.staff?.id === staffId &&
                sDate.getDate() === date.getDate() &&
                sDate.getMonth() === date.getMonth() &&
                sDate.getFullYear() === date.getFullYear();
        });
    };

    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!staff || staff.length === 0) return <div className="p-4 text-center text-muted">No staff members found. Add staff to see the roster.</div>;

    return (
        <div className="roster-matrix">
            {/* Header / Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button className="btn btn-secondary" onClick={handlePrevWeek}>&larr; Prev Week</button>
                <h3 style={{ margin: 0 }}>
                    {weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} - {addDays(weekStart, 6).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
                <button className="btn btn-secondary" onClick={handleNextWeek}>Next Week &rarr;</button>
            </div>

            {/* Matrix Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-sm)', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', background: 'var(--slate-50)', borderBottom: '2px solid var(--slate-200)', minWidth: '150px' }}>Staff</th>
                            {weekDays.map(day => (
                                <th key={day.toISOString()} style={{ padding: '0.75rem', background: 'var(--slate-50)', borderBottom: '2px solid var(--slate-200)', borderLeft: '1px solid var(--slate-200)', minWidth: '120px' }}>
                                    <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--slate-500)' }}>{day.toLocaleDateString([], { weekday: 'short' })}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{day.getDate()}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                                <td style={{ padding: '1rem', fontWeight: 600, background: 'white', position: 'sticky', left: 0, zIndex: 1, borderRight: '1px solid var(--slate-200)' }}>
                                    {s.name}
                                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontWeight: 400 }}>{s.jobTitle}</div>
                                </td>
                                {weekDays.map(day => {
                                    const cellShifts = getShiftsForCell(s.id, day);
                                    return (
                                        <td key={day.toISOString()} style={{ padding: '0.5rem', borderLeft: '1px solid var(--slate-100)', verticalAlign: 'top', height: '100px', background: cellShifts.length > 0 ? 'var(--slate-50)' : 'white' }}>
                                            {cellShifts.map(dto => {
                                                const shift = dto.scheduledShift;
                                                const isMatched = dto.status === 'MATCHED';
                                                return (
                                                    <div
                                                        key={shift.id}
                                                        className="shift-card"
                                                        style={{
                                                            background: 'white',
                                                            border: `1px solid ${shift.published ? '#22c55e' : 'var(--primary)'}`,
                                                            borderLeftWidth: '4px',
                                                            padding: '0.4rem',
                                                            borderRadius: '4px',
                                                            marginBottom: '0.4rem',
                                                            fontSize: '0.8rem',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => onEditShift && onEditShift(shift)}
                                                    >
                                                        <div style={{ fontWeight: 700 }}>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</div>
                                                        <div className="text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shift.jobArea?.name}</div>

                                                        {/* Comparison Data */}
                                                        <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #eee', fontSize: '0.75rem' }}>
                                                            {isMatched ? (
                                                                <div style={{ color: dto.varianceMinutes > 15 || dto.varianceMinutes < -15 ? 'red' : 'green' }}>
                                                                    Actual: {formatTime(dto.actualStart)} - {formatTime(dto.actualEnd)}
                                                                </div>
                                                            ) : (
                                                                <div style={{ color: 'orange', fontStyle: 'italic' }}>
                                                                    No Clock-in Found
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {loading && <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--slate-500)' }}>Loading schedule...</div>}
        </div>
    );
};

export default RosterMatrix;
