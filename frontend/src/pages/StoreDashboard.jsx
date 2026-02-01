import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StoreDashboard = () => {
    const { user, logout, loading } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [store, setStore] = useState(null);
    const [staff, setStaff] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [jobAreas, setJobAreas] = useState([]);
    const [offers, setOffers] = useState([]);

    // Tabs: 'orders', 'menu', 'profile', 'staff', 'roster', 'offers'
    const [activeTab, setActiveTab] = useState('orders');

    const [editingItem, setEditingItem] = useState(null); // For Menu, Staff, Shift, Offer
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'menu', 'staff', 'shift', 'jobArea', 'offer'

    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return; // Wait for auth to load
        if (!user || user.role !== 'STORE_OWNER') {
            navigate('/login');
            return;
        }
        fetchData();
        const interval = setInterval(() => {
            if (activeTab === 'orders') fetchOrders();
        }, 5000);
        return () => clearInterval(interval);
    }, [user, activeTab, loading]);

    const fetchData = async () => {
        await fetchOrders();
        if (activeTab === 'menu') await fetchMenu();
        if (activeTab === 'profile') await fetchStoreProfile();
        if (activeTab === 'staff') { await fetchStaff(); await fetchJobAreas(); }
        if (activeTab === 'roster') { await fetchShifts(); await fetchStaff(); await fetchJobAreas(); }
        if (activeTab === 'offers') await fetchOffers();
    };

    // --- Fetchers ---
    const fetchOrders = async () => { try { const res = await api.get(`/orders/store/${user.storeId}`); setOrders(res.data); } catch (err) { console.error(err); } };
    const fetchMenu = async () => { try { const res = await api.get(`/stores/${user.storeId}/menu`); setMenu(res.data); } catch (err) { console.error(err); } };
    const fetchStoreProfile = async () => { try { const res = await api.get(`/stores/${user.storeId}`); setStore(res.data); } catch (err) { console.error(err); } };
    const fetchStaff = async () => { try { const res = await api.get(`/staff/store/${user.storeId}`); setStaff(res.data); } catch (err) { console.error(err); } };
    const fetchShifts = async () => { try { const res = await api.get(`/shifts/store/${user.storeId}`); setShifts(res.data); } catch (err) { console.error(err); } };
    const fetchJobAreas = async () => { try { const res = await api.get(`/job-areas/store/${user.storeId}`); setJobAreas(res.data); } catch (err) { console.error(err); } };
    const fetchOffers = async () => { try { const res = await api.get(`/offers/store/${user.storeId}`); setOffers(res.data); } catch (err) { console.error(err); } };

    // --- Actions ---
    const updateStatus = async (orderId, status) => { try { await api.put(`/orders/${orderId}/status?status=${status}`); fetchOrders(); } catch (err) { console.error(err); } };

    // Generic Delete
    const handleDelete = async (url, callback) => {
        if (!window.confirm("Are you sure?")) return;
        try { await api.delete(url); callback(); } catch (err) { console.error(err); }
    };

    // Generic Save
    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (modalType === 'menu') {
                data.price = parseFloat(data.price);
                data.available = formData.get('available') === 'on';
                if (editingItem?.id) await api.put(`/stores/menu/${editingItem.id}`, data);
                else await api.post(`/stores/${user.storeId}/menu`, data);
                fetchMenu();
            } else if (modalType === 'staff') {
                data.hourlyRate = parseFloat(data.hourlyRate);
                if (editingItem?.id) {
                    const staffPayload = {
                        ...data,
                        jobArea: data.jobAreaId ? { id: data.jobAreaId } : null
                    };
                    await api.put(`/staff/${editingItem.id}`, staffPayload);
                } else {
                    const staffPayload = {
                        ...data,
                        store: { id: user.storeId },
                        jobArea: data.jobAreaId ? { id: data.jobAreaId } : null
                    };
                    await api.post('/staff', staffPayload);
                }
                fetchStaff();
            } else if (modalType === 'shift') {
                const shiftPayload = {
                    staff: { id: data.staffId },
                    jobArea: { id: data.jobAreaId },
                    startTime: data.startTime,
                    endTime: data.endTime,
                    published: false
                };
                if (editingItem?.id) await api.put(`/shifts/${editingItem.id}`, shiftPayload);
                else await api.post('/shifts', shiftPayload);
                fetchShifts();
            } else if (modalType === 'jobArea') {
                await api.post(`/job-areas/store/${user.storeId}`, data);
                fetchJobAreas();
            } else if (modalType === 'offer') {
                data.discountPercentage = parseFloat(data.discountPercentage);
                data.active = formData.get('active') === 'on';
                if (editingItem?.id) await api.put(`/offers/${editingItem.id}`, data);
                else {
                    const offerPayload = { ...data, store: { id: user.storeId } };
                    await api.post('/offers', offerPayload);
                }
                fetchOffers();
            }
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (err) { console.error(err); }
    };

    const handlePublishRoster = async () => {
        if (!window.confirm("Publish roster? This will notify staff.")) return;
        try { await api.post(`/shifts/publish/${user.storeId}`); fetchShifts(); alert("Roster Published!"); } catch (err) { console.error(err); }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try { await api.put(`/stores/${user.storeId}`, data); alert("Profile updated!"); fetchStoreProfile(); } catch (err) { console.error(err); }
    };

    if (loading || !user) return <div>Loading...</div>;

    const openModal = (type, item = {}) => {
        setModalType(type);
        setEditingItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                <h1>Store Dashboard</h1>
                <button onClick={logout} className="btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Logout</button>
            </header>

            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {['orders', 'menu', 'staff', 'roster', 'offers', 'profile'].map(tab => (
                    <button key={tab} className={`btn ${activeTab === tab ? '' : 'btn-secondary'}`} onClick={() => setActiveTab(tab)} style={{ width: 'auto', textTransform: 'capitalize' }}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div>
                    <h2>Incoming Orders</h2>
                    <div style={{ marginTop: '1rem' }}>
                        {orders.length === 0 ? <p>No orders yet.</p> : orders.map(order => (
                            <div key={order.id} style={{ background: 'white', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3>Order #{order.id}</h3>
                                    <span style={{ fontWeight: 'bold' }}>{order.status}</span>
                                </div>
                                <p>Customer: {order.customer.email}</p>
                                <p>Pickup: {new Date(order.pickupTime).toLocaleString()}</p>
                                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                                    {order.items.map((item, idx) => <li key={idx}>{item.quantity}x {item.menuItem.name}</li>)}
                                </ul>
                                <p style={{ fontWeight: 'bold' }}>Total: ${order.total.toFixed(2)}</p>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    {order.status === 'PENDING' && (<> <button className="btn" onClick={() => updateStatus(order.id, 'ACCEPTED')}>Accept</button> <button className="btn" style={{ background: '#dc3545' }} onClick={() => updateStatus(order.id, 'REJECTED')}>Reject</button> </>)}
                                    {order.status === 'ACCEPTED' && <button className="btn" onClick={() => updateStatus(order.id, 'READY')}>Mark Ready</button>}
                                    {order.status === 'READY' && <button className="btn" style={{ background: '#28a745' }} onClick={() => updateStatus(order.id, 'COMPLETED')}>Complete</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MENU TAB */}
            {activeTab === 'menu' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Menu Items</h2>
                        <button className="btn" style={{ width: 'auto' }} onClick={() => openModal('menu')}>Add Item</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        {menu.map(item => (
                            <div key={item.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>
                                <p>${item.price.toFixed(2)}</p>
                                <p>{item.available ? 'Available' : 'Unavailable'}</p>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <button className="btn-secondary" style={{ marginRight: '0.5rem', width: 'auto' }} onClick={() => openModal('menu', item)}>Edit</button>
                                    <button className="btn" style={{ background: 'red', width: 'auto' }} onClick={() => handleDelete(`/stores/menu/${item.id}`, fetchMenu)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STAFF TAB */}
            {activeTab === 'staff' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Staff Members</h2>
                        <button className="btn" style={{ width: 'auto' }} onClick={() => openModal('staff')}>Add Staff</button>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        {staff.map(s => (
                            <div key={s.id} style={{ background: 'white', padding: '1.25rem', marginBottom: '0.75rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)', border: '1px solid #f1f5f9' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{s.name}</h3>
                                        {s.jobArea && <span style={{ background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', textTransform: 'uppercase' }}>{s.jobArea.name}</span>}
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{s.jobTitle} • ${s.hourlyRate}/hr</p>
                                    <small style={{ color: '#94a3b8' }}>{s.email} | {s.phone}</small>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => openModal('staff', s)}>Edit</button>
                                    <button className="btn" style={{ background: '#fee2e2', color: '#ef4444', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }} onClick={() => handleDelete(`/staff/${s.id}`, fetchStaff)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <h3>Job Areas</h3>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
                            {jobAreas.map(ja => (
                                <span key={ja.id} style={{ background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {ja.name}
                                    <button onClick={() => handleDelete(`/job-areas/${ja.id}`, fetchJobAreas)} style={{ border: 'none', background: 'none', color: '#94a3b8', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>×</button>
                                </span>
                            ))}
                            <button className="btn-secondary" style={{ width: 'auto', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.85rem', border: '1px dashed var(--primary-color)', background: 'transparent', color: 'var(--primary-color)' }} onClick={() => openModal('jobArea')}>+ Add Area</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ROSTER TAB */}
            {activeTab === 'roster' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Roster</h2>
                        <div>
                            <button className="btn-secondary" style={{ width: 'auto', marginRight: '1rem' }} onClick={() => openModal('shift')}>Add Shift</button>
                            <button className="btn" style={{ width: 'auto' }} onClick={handlePublishRoster}>Publish Roster</button>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                        {shifts.map(shift => (
                            <div key={shift.id} style={{ background: shift.published ? '#e8f5e9' : 'white', padding: '1rem', borderRadius: '8px', borderLeft: `5px solid ${shift.published ? 'green' : 'orange'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold' }}>{new Date(shift.startTime).toLocaleString()} - {new Date(shift.endTime).toLocaleTimeString()}</span>
                                    <span>{shift.published ? 'Published' : 'Draft'}</span>
                                </div>
                                <p><strong>{shift.staff?.name}</strong> in {shift.jobArea?.name}</p>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <button className="btn-secondary" style={{ width: 'auto', marginRight: '0.5rem' }} onClick={() => openModal('shift', shift)}>Edit</button>
                                    <button className="btn" style={{ background: 'red', width: 'auto' }} onClick={() => handleDelete(`/shifts/${shift.id}`, fetchShifts)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* OFFERS TAB */}
            {activeTab === 'offers' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Offer & Discounts</h2>
                        <button className="btn" style={{ width: 'auto' }} onClick={() => openModal('offer')}>Add Offer</button>
                    </div>
                    <div className="grid-responsive fade-in" style={{ marginTop: '1rem' }}>
                        {offers.map(offer => (
                            <div key={offer.id} style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', transition: 'var(--transition)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary-color)' }}>{offer.code}</h3>
                                    <span className={`status-badge ${offer.active ? 'active' : 'inactive'}`} style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        background: offer.active ? '#dcfce7' : '#f1f5f9',
                                        color: offer.active ? '#166534' : '#64748b'
                                    }}>{offer.active ? 'Active' : 'Inactive'}</span>
                                </div>
                                <p className="text-sm" style={{ color: '#64748B', marginBottom: '0.5rem' }}>{offer.description}</p>
                                <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)', margin: '0.5rem 0' }}>{offer.discountPercentage}% OFF</p>

                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-secondary" style={{ width: 'auto', flex: 1, padding: '0.5rem' }} onClick={() => openModal('offer', offer)}>Edit</button>
                                    <button className="btn" style={{ background: '#FECaca', color: '#991B1B', width: 'auto', flex: 1, padding: '0.5rem', boxShadow: 'none' }} onClick={() => handleDelete(`/offers/${offer.id}`, fetchOffers)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && store && (
                <div className="fade-in" style={{ maxWidth: '600px', background: 'white', padding: '2.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>Edit Store Profile</h2>
                    <form onSubmit={handleSaveProfile}>
                        <div className="form-group"><label>Store Name</label><input name="name" defaultValue={store.name} required /></div>
                        <div className="form-group"><label>Address</label><input name="address" defaultValue={store.address} /></div>
                        <div className="form-group"><label>Image URL</label><input name="imageUrl" defaultValue={store.imageUrl} /></div>
                        <button className="btn" style={{ marginTop: '1rem' }}>Save Changes</button>
                    </form>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setIsModalOpen(false)}>
                    <div className="fade-in" style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius)', width: '90%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--secondary-color)' }}>{editingItem?.id ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</h3>
                        <form onSubmit={handleSave}>
                            {modalType === 'menu' && (
                                <>
                                    <div className="form-group"><label>Name</label><input name="name" defaultValue={editingItem?.name} required /></div>
                                    <div className="form-group"><label>Description</label><textarea name="description" defaultValue={editingItem?.description} rows="3" /></div>
                                    <div className="form-group"><label>Price ($)</label><input name="price" type="number" step="0.01" defaultValue={editingItem?.price} required /></div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" name="available" defaultChecked={editingItem?.available ?? true} style={{ width: 'auto' }} /> <label style={{ margin: 0, cursor: 'pointer' }}>Available</label></div>
                                </>
                            )}
                            {modalType === 'staff' && (
                                <>
                                    <div className="form-group"><label>Name</label><input name="name" defaultValue={editingItem?.name} required /></div>
                                    <div className="form-group"><label>Email</label><input name="email" type="email" defaultValue={editingItem?.email} /></div>
                                    <div className="form-group"><label>Phone</label><input name="phone" defaultValue={editingItem?.phone} /></div>
                                    <div className="form-group"><label>Job Title</label><input name="jobTitle" defaultValue={editingItem?.jobTitle} /></div>
                                    <div className="form-group">
                                        <label>Job Area</label>
                                        <select name="jobAreaId" defaultValue={editingItem?.jobArea?.id}>
                                            <option value="">Select Job Area</option>
                                            {jobAreas.map(ja => <option key={ja.id} value={ja.id}>{ja.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Hourly Rate ($)</label><input name="hourlyRate" type="number" step="0.01" defaultValue={editingItem?.hourlyRate} /></div>
                                </>
                            )}
                            {modalType === 'jobArea' && (
                                <div className="form-group"><label>Area Name</label><input name="name" required /></div>
                            )}
                            {modalType === 'shift' && (
                                <>
                                    <div className="form-group">
                                        <label>Staff</label>
                                        <select name="staffId" defaultValue={editingItem?.staff?.id} required>
                                            <option value="">Select Staff</option>
                                            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Job Area</label>
                                        <select name="jobAreaId" defaultValue={editingItem?.jobArea?.id} required>
                                            <option value="">Select Area</option>
                                            {jobAreas.map(ja => <option key={ja.id} value={ja.id}>{ja.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Start Time</label><input name="startTime" type="datetime-local" defaultValue={editingItem?.startTime} required /></div>
                                    <div className="form-group"><label>End Time</label><input name="endTime" type="datetime-local" defaultValue={editingItem?.endTime} required /></div>
                                </>
                            )}
                            {modalType === 'offer' && (
                                <>
                                    <div className="form-group"><label>Code</label><input name="code" defaultValue={editingItem?.code} required /></div>
                                    <div className="form-group"><label>Description</label><input name="description" defaultValue={editingItem?.description} /></div>
                                    <div className="form-group"><label>Discount (%)</label><input name="discountPercentage" type="number" step="0.01" defaultValue={editingItem?.discountPercentage} required /></div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" name="active" defaultChecked={editingItem?.active ?? true} style={{ width: 'auto' }} /> <label style={{ margin: 0, cursor: 'pointer' }}>Active</label></div>
                                </>
                            )}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: '#F1F5F9', color: '#475569', border: 'none' }}>Cancel</button>
                                <button className="btn" style={{ flex: 1 }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreDashboard;
