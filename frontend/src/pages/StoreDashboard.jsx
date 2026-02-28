import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RosterMatrix from '../components/RosterMatrix';
import RosterReport from '../components/RosterReport';
import ProcedureManager from '../components/ProcedureManager';
import KnowledgeBase from '../components/KnowledgeBase';
import ChatInterface from '../components/ChatInterface';
import IntelligenceSettings from '../components/IntelligenceSettings';
import InsightsDashboard from '../components/InsightsDashboard';

const StoreDashboard = () => {
    const { user, loading, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [storeProfile, setStoreProfile] = useState(null);
    const [staff, setStaff] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [jobAreas, setJobAreas] = useState([]);
    const [offers, setOffers] = useState([]);
    const [invoices, setInvoices] = useState([]);

    // Tabs: 'orders', 'menu', 'profile', 'staff', 'roster', 'offers', 'inventory'
    const [activeTab, setActiveTab] = useState('orders');

    const [editingItem, setEditingItem] = useState(null); // For Menu, Staff, Shift, Offer
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'menu', 'staff', 'shift', 'jobArea', 'offer'
    const [showReport, setShowReport] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: '' });
    const [isChatOpen, setIsChatOpen] = useState(false); // Widget state

    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return; // Wait for auth to load
        if (!user || user.role !== 'STORE_OWNER') {
            navigate('/login');
            return;
        }

        if (!user.storeId) {
            console.warn("Store Owner has no storeId. Cannot fetch dashboard data.");
            return;
        }

        fetchData();
        const interval = setInterval(() => {
            if (activeTab === 'orders') fetchOrders();
        }, 5000);
        return () => clearInterval(interval);
    }, [user, activeTab, loading]);

    const fetchData = async () => {
        if (!user.storeId) return;
        await fetchOrders();
        if (activeTab === 'menu') await fetchMenu();
        if (activeTab === 'profile') await fetchStoreProfile();
        if (activeTab === 'staff') { await fetchStaff(); await fetchJobAreas(); }
        if (activeTab === 'roster') { await fetchShifts(); await fetchStaff(); await fetchJobAreas(); }
        if (activeTab === 'offers') await fetchOffers();
        if (activeTab === 'inventory') await fetchInvoices();
    };

    // --- Fetchers ---
    const fetchOrders = async () => { try { const res = await api.get(`/orders/store/${user.storeId}`); setOrders(res.data); } catch (err) { console.error(err); } };
    const fetchMenu = async () => { try { const res = await api.get(`/products/store/${user.storeId}`); setMenu(res.data); } catch (err) { console.error(err); } };
    const fetchStoreProfile = async () => { try { const res = await api.get(`/stores/${user.storeId}`); setStoreProfile(res.data); } catch (err) { console.error(err); } };
    const fetchStaff = async () => { try { const res = await api.get(`/users/store/${user.storeId}/staff`); setStaff(res.data); } catch (err) { console.error(err); } };
    const fetchShifts = async () => { try { const res = await api.get(`/shifts/store/${user.storeId}`); setShifts(res.data); } catch (err) { console.error(err); } };
    const fetchJobAreas = async () => { try { const res = await api.get(`/job-areas/store/${user.storeId}`); setJobAreas(res.data); } catch (err) { console.error(err); } };
    const fetchOffers = async () => { try { const res = await api.get(`/offers/store/${user.storeId}`); setOffers(res.data); } catch (err) { console.error(err); } };
    const fetchInvoices = async () => { try { const res = await api.get(`/stores/${user.storeId}/invoices`); setInvoices(res.data); } catch (err) { console.error(err); } };

    // --- Actions ---
    const handleUpdateStatus = async (orderId, status) => { try { await api.put(`/orders/${orderId}/status?status=${status}`); fetchOrders(); } catch (err) { console.error(err); } };

    // Generic Delete
    const handleDelete = async (url, callback) => {
        if (!window.confirm("Are you sure?")) return;
        try { await api.delete(url); callback(); } catch (err) { console.error(err); }
    };

    const handleAddItem = async (e) => { e.preventDefault(); await api.post(`/products/store/${user.storeId}`, newItem); setNewItem({ name: '', price: '', description: '', category: '' }); fetchMenu(); };
    const handleUpdateProfile = async (e) => { e.preventDefault(); await api.put(`/stores/${user.storeId}`, storeProfile); alert('Profile updated!'); };
    const handleAddStaff = async (e) => { e.preventDefault(); const email = e.target.email.value; await api.post(`/stores/${user.storeId}/staff`, { email }); e.target.reset(); fetchStaff(); };
    const handleAddJobArea = async (e) => { e.preventDefault(); const name = e.target.name.value; await api.post(`/job-areas/store/${user.storeId}`, { name }); e.target.reset(); fetchJobAreas(); };
    const handlePublishRoster = async () => { try { await api.post(`/shifts/publish/${user.storeId}`); alert('Roster Published!'); } catch (err) { alert('Failed to publish'); } };
    const handleCreateOffer = async (e) => { e.preventDefault(); const formData = new FormData(e.target); const offerData = Object.fromEntries(formData.entries()); await api.post(`/offers/store/${user.storeId}`, offerData); e.target.reset(); fetchOffers(); };
    const handleDeleteOffer = async (id) => { await api.delete(`/offers/${id}`); fetchOffers(); };
    const handleFileUpload = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const file = formData.get("file");
        if (!file || !file.size) return;
        formData.append("storeId", user.storeId);
        try {
            await api.post(`/stores/${user.storeId}/invoices/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            alert("Invoice uploaded successfully!");
            setIsModalOpen(false);
            fetchInvoices();
        } catch (error) {
            console.error("Error uploading invoice:", error);
            alert("Failed to upload invoice.");
        }
    };

    const handleApproveInvoice = async (invoiceId) => {
        try {
            await api.put(`/stores/${user.storeId}/invoices/${invoiceId}/status?status=APPROVED`);
            alert("Invoice approved successfully!");
            setIsModalOpen(false);
            fetchInvoices();
        } catch (error) {
            console.error("Error approving invoice:", error);
            alert("Failed to approve invoice.");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            if (modalType === 'menu') {
                if (editingItem?.id) await api.put(`/products/${editingItem.id}`, data);
                else await api.post(`/products/store/${user.storeId}`, data);
                fetchMenu();
            } else if (modalType === 'staff') {
                const payload = { ...data, jobArea: { id: data.jobAreaId } };
                if (editingItem?.id) await api.put(`/users/${editingItem.id}`, payload);
                fetchStaff();
            } else if (modalType === 'jobArea') {
                await api.post(`/job-areas/store/${user.storeId}`, data);
                fetchJobAreas();
            } else if (modalType === 'shift') {
                const payload = { staff: { id: data.staffId }, jobArea: { id: data.jobAreaId }, startTime: data.startTime, endTime: data.endTime, published: true };
                if (editingItem?.id) await api.put(`/shifts/${editingItem.id}`, payload);
                else await api.post(`/shifts/store/${user.storeId}`, payload);
                fetchShifts();
            } else if (modalType === 'offer') {
                if (editingItem?.id) await api.put(`/offers/${editingItem.id}`, data);
                else await api.post(`/offers/store/${user.storeId}`, data);
                fetchOffers();
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save changes.');
        }
    };

    const renderInvoiceReviewContent = () => {
        try {
            console.log("Rendering Invoice Review Content. Item:", editingItem);
            if (!editingItem) return <div>No invoice data found.</div>;

            let details = {};
            try {
                details = editingItem.rawJsonData ? JSON.parse(editingItem.rawJsonData) : {};
            } catch (e) {
                console.error("JSON Parse Error:", e);
                details = {};
            }
            const items = details.items || [];

            return (
                <div className="animate-in">
                    <div className="grid-responsive" style={{ marginBottom: '2rem', background: 'var(--slate-50)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                            <label className="label" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Supplier</label>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{details.supplier || 'Unknown'}</div>
                        </div>
                        <div>
                            <label className="label" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Date</label>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{details.date || 'Unknown'}</div>
                        </div>
                        <div>
                            <label className="label" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Amount</label>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>${(details.total || 0).toFixed(2)}</div>
                        </div>
                    </div>

                    <h4 style={{ marginBottom: '1rem' }}>Line Items</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-sm)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ background: 'var(--slate-50)', position: 'sticky', top: 0 }}>
                                <tr>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Price</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                                        <td style={{ padding: '0.75rem' }}>{item.name}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>${item.price?.toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>${item.total?.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {items.length === 0 && <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--slate-400)' }}>No items found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } catch (err) {
            console.error("Error rendering invoice review content:", err);
            return <div className="text-danger">Error loading invoice details.</div>;
        }
    };

    if (loading || !user) return <div>Loading...</div>;

    const openModal = (type, item = {}) => {
        console.log("Opening Modal:", type, item);
        setModalType(type);
        setEditingItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="dashboard-layout" style={{ position: 'relative' }}>
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Store Dashboard</h2>
                    <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem', margin: 0 }}>Welcome, {user.email}</p>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column' }}>
                    <button onClick={() => setActiveTab('orders')} className={`sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}>Orders & Live Feed</button>
                    <button onClick={() => setActiveTab('menu')} className={`sidebar-btn ${activeTab === 'menu' ? 'active' : ''}`}>Menu Management</button>
                    <button onClick={() => setActiveTab('staff')} className={`sidebar-btn ${activeTab === 'staff' ? 'active' : ''}`}>Staff & Areas</button>
                    <button onClick={() => setActiveTab('roster')} className={`sidebar-btn ${activeTab === 'roster' ? 'active' : ''}`}>Roster & Shifts</button>
                    <button onClick={() => setActiveTab('procedures')} className={`sidebar-btn ${activeTab === 'procedures' ? 'active' : ''}`}>Procedures</button>
                    <button onClick={() => setActiveTab('knowledge')} className={`sidebar-btn ${activeTab === 'knowledge' ? 'active' : ''}`}>Knowledge Base</button>
                    {/* Chat Tab Removed - Now Floating Widget */}
                    <button onClick={() => setActiveTab('offers')} className={`sidebar-btn ${activeTab === 'offers' ? 'active' : ''}`}>Offers & Deals</button>
                    <button onClick={() => setActiveTab('inventory')} className={`sidebar-btn ${activeTab === 'inventory' ? 'active' : ''}`}>Inventory (Invoices)</button>
                    <button onClick={() => setActiveTab('intelligence')} className={`sidebar-btn ${activeTab === 'intelligence' ? 'active' : ''}`}>AI Insights</button>
                    <button onClick={() => setActiveTab('intelligence_config')} className={`sidebar-btn ${activeTab === 'intelligence_config' ? 'active' : ''}`}>Insights Setup</button>
                    <button onClick={() => setActiveTab('profile')} className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}>Store Profile</button>

                    <div style={{ flex: 1 }}></div>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="sidebar-btn"
                        style={{ marginTop: 'auto', borderTop: '1px solid var(--slate-700)', color: '#ef4444' }}
                    >
                        Sign Out
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Floating Chat Widget */}
                <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {isChatOpen && (
                        <div className="card animate-in" style={{ marginBottom: '1rem', width: '384px', overflow: 'hidden', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-lg)' }}>
                            <ChatInterface />
                        </div>
                    )}
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        style={{ background: 'var(--primary)', color: 'white', width: '60px', height: '60px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                    >
                        {isChatOpen ? (
                            <span style={{ fontSize: '1.5rem' }}>&times;</span>
                        ) : (
                            <span style={{ fontSize: '1.5rem' }}>🤖</span>
                        )}
                    </button>
                </div>

                {activeTab === 'orders' && (
                    <div className="animate-in">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Live Orders</h2>
                        <div className="grid-responsive">
                            {orders.length === 0 ? (
                                <div className="card" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1/-1' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                                    <h3>No orders yet</h3>
                                    <p className="text-muted">New orders will appear here in real-time.</p>
                                </div>
                            ) : orders.map(order => (
                                <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Order #{order.id}</h3>
                                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>{new Date(order.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <span className={`badge ${order.status === 'PENDING' ? 'badge-warning' : 'badge-success'}`}>{order.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                                <span>{item.quantity}x {item.menuItem.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {order.status === 'PENDING' && (<>
                                            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}>Accept</button>
                                            <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleUpdateStatus(order.id, 'REJECTED')}>Reject</button>
                                        </>)}
                                        {order.status === 'ACCEPTED' && <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleUpdateStatus(order.id, 'READY')}>Ready for Pickup</button>}
                                        {order.status === 'READY' && <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}>Complete</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="animate-in">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Menu Management</h2>
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Add New Item</h3>
                            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}><label className="label">Name</label><input type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="input" required /></div>
                                <div className="form-group" style={{ marginBottom: 0 }}><label className="label">Description</label><textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="input" /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}><label className="label">Price</label><input type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="input" required /></div>
                                    <div className="form-group" style={{ marginBottom: 0 }}><label className="label">Category</label><input type="text" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="input" /></div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Add Item</button>
                            </form>
                        </div>
                        <div className="grid-responsive">
                            {menu.map(item => (
                                <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h4>
                                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>{item.category}</p>
                                        <p style={{ fontWeight: 600, marginTop: '0.25rem' }}>${item.price}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-logout" onClick={() => handleDelete(`/products/${item.id}`, fetchMenu)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STAFF TAB */}
                {
                    activeTab === 'staff' && (
                        <div className="animate-in">
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                                <button className="btn btn-primary" onClick={() => openModal('staff')}>+ Add Team Member</button>
                            </div>
                            <div className="grid-responsive">
                                {staff.map(s => (
                                    <div key={s.id} className="card" style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{s.name}</h3>
                                                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>{s.jobTitle}</p>
                                                </div>
                                            </div>
                                            {s.jobArea && <span className="badge badge-primary">{s.jobArea.name}</span>}
                                        </div>
                                        <div style={{ padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span className="text-muted">Rate</span>
                                                <span style={{ fontWeight: 600 }}>${s.hourlyRate}/hr</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span className="text-muted">Contact</span>
                                                <span style={{ fontWeight: 600 }}>{s.phone}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => openModal('staff', s)}>Edit</button>
                                            <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(`/staff/${s.id}`, fetchStaff)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '3rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Job Areas</h3>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {jobAreas.map(ja => (
                                        <div key={ja.id} className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                            <span style={{ fontWeight: 600 }}>{ja.name}</span>
                                            <button onClick={() => handleDelete(`/job-areas/${ja.id}`, fetchJobAreas)} className="btn-logout" style={{ padding: 0 }}>×</button>
                                        </div>
                                    ))}
                                    <button className="btn btn-secondary btn-sm" style={{ borderStyle: 'dashed' }} onClick={() => openModal('jobArea')}>+ Add Area</button>
                                </div>
                            </div>
                        </div>
                    )
                }


                {/* ROSTER TAB */}
                {
                    activeTab === 'roster' && (
                        <div className="animate-in">
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                                <button className="btn btn-secondary" onClick={() => setShowReport(!showReport)}>
                                    {showReport ? 'Show Roster View' : '📊 View Report'}
                                </button>
                                <button className="btn btn-secondary" onClick={() => openModal('shift')}>+ Add New Shift</button>
                                <button className="btn btn-primary" onClick={handlePublishRoster}>📢 Publish Roster</button>
                            </div>

                            {showReport ? (
                                <RosterReport storeId={user?.storeId} />
                            ) : (
                                <RosterMatrix
                                    storeId={user.storeId}
                                    staff={staff}
                                    onEditShift={(shift) => openModal('shift', shift)}
                                    onDeleteShift={(id) => handleDelete(`/shifts/${id}`, fetchShifts)}
                                />
                            )}
                        </div>
                    )
                }

                {/* PROCEDURES TAB */}
                {activeTab === 'procedures' && <ProcedureManager storeId={user.storeId} />}

                {/* OFFERS TAB */}
                {
                    activeTab === 'offers' && (
                        <div className="animate-in">
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                                <button className="btn btn-primary" onClick={() => openModal('offer')}>+ Create New Offer</button>
                            </div>
                            <div className="grid-responsive">
                                {offers.map(offer => (
                                    <div key={offer.id} className="card" style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.25rem' }}>
                                            <h3 style={{ margin: 0 }}>{offer.code}</h3>
                                            <span className={`badge ${offer.active ? 'badge-success' : 'badge-warning'}`}>
                                                {offer.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                            {offer.discountPercentage}% <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--slate-400)' }}>OFF</span>
                                        </div>
                                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{offer.description}</p>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => openModal('offer', offer)}>Edit</button>
                                            <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(`/offers/${offer.id}`, fetchOffers)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* --- Inventory & Costs Tab --- */}
                {
                    activeTab === 'inventory' && (
                        <div className="animate-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Inventory & Costs</h1>
                                    <p style={{ color: 'var(--slate-500)' }}>Automated supply chain expense tracking powered by Claude 3.5</p>
                                </div>
                                <button className="btn btn-primary" onClick={() => openModal('invoice')}>+ Upload New Invoice</button>
                            </div>

                            <div className="grid-responsive" style={{ marginBottom: '3rem' }}>
                                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--slate-500)', marginBottom: '0.5rem' }}>Total COGS (Monthly)</p>
                                    <h2 style={{ fontSize: '2.5rem' }}>${invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0).toFixed(2)}</h2>
                                </div>
                                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--slate-500)', marginBottom: '0.5rem' }}>Parsed Invoices</p>
                                    <h2 style={{ fontSize: '2.5rem' }}>{invoices.length}</h2>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Recent Invoices</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--slate-100)' }}>
                                            <th style={{ padding: '1rem' }}>Supplier</th>
                                            <th style={{ padding: '1rem' }}>Date</th>
                                            <th style={{ padding: '1rem' }}>Status</th>
                                            <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map(inv => (
                                            <tr key={inv.id} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>{inv.supplierName || 'Extracting...'}</td>
                                                <td style={{ padding: '1rem' }}>{inv.invoiceDate}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className={`badge ${inv.status === 'APPROVED' ? 'badge-success' : 'badge-primary'}`}>{inv.status}</span>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800 }}>
                                                    ${inv.totalAmount?.toFixed(2)}{' '}
                                                    {inv.status === 'PENDING_REVIEW' && (
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            style={{ marginLeft: '1rem', border: '1px solid var(--slate-300)' }}
                                                            onClick={() => openModal('invoice-review', inv)}
                                                        >
                                                            Review
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {invoices.length === 0 && (
                                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-400)' }}>No invoices uploaded yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {/* KNOWLEDGE BASE TAB */}
                {activeTab === 'knowledge' && <KnowledgeBase />}

                {/* INTELLIGENCE TABS */}
                {activeTab === 'intelligence' && <InsightsDashboard storeId={user.storeId} />}
                {activeTab === 'intelligence_config' && <IntelligenceSettings storeId={user.storeId} />}

                {/* PROFILE TAB */}
                {
                    activeTab === 'profile' && storeProfile && (
                        <div className="animate-in">
                            <div className="card" style={{ maxWidth: '600px', padding: '2.5rem' }}>
                                <h2 style={{ marginBottom: '2rem' }}>Edit Store Profile</h2>
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="form-group">
                                        <label className="label">Store Name</label>
                                        <input className="input" name="name" defaultValue={storeProfile.name} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Address</label>
                                        <input className="input" name="address" defaultValue={storeProfile.address} />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Image URL</label>
                                        <input className="input" name="imageUrl" defaultValue={storeProfile.imageUrl} />
                                    </div>
                                    <button className="btn btn-primary" style={{ marginTop: '1rem', width: '200px' }}>Save Profile Changes</button>
                                </form>
                            </div>
                        </div>
                    )
                }

            </div>

            {/* MODAL PORTAL */}
            {
                isModalOpen && createPortal(
                    <div className="modal-overlay" style={{ zIndex: 99999 }} onClick={() => setIsModalOpen(false)}>
                        <div className="modal animate-in" style={{ padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto', maxWidth: modalType === 'invoice-review' ? '800px' : '500px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                                    {modalType === 'invoice-review' ? 'Review Invoice' :
                                        modalType === 'test' ? 'Test Modal' :
                                            (editingItem?.id ? 'Edit' : 'Add') + ' ' + modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="btn-logout" style={{ fontSize: '1.5rem', padding: 0 }}>×</button>
                            </div>

                            <form onSubmit={modalType === 'invoice' ? handleFileUpload : handleSave}>

                                {modalType === 'menu' && (
                                    <>
                                        <div className="form-group"><label className="label">Item Name</label><input className="input" name="name" defaultValue={editingItem?.name} required /></div>
                                        <div className="form-group"><label className="label">Description</label><textarea className="input" name="description" defaultValue={editingItem?.description} rows="3" /></div>
                                        <div className="form-group"><label className="label">Price ($)</label><input className="input" name="price" type="number" step="0.01" defaultValue={editingItem?.price} required /></div>
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <input type="checkbox" name="available" defaultChecked={editingItem?.available ?? true} style={{ width: '20px', height: '20px' }} />
                                            <label className="label" style={{ margin: 0 }}>Item is currently available</label>
                                        </div>
                                    </>
                                )}
                                {modalType === 'staff' && (
                                    <>
                                        <div className="form-group"><label className="label">Full Name</label><input className="input" name="name" defaultValue={editingItem?.name} required /></div>
                                        <div className="grid-responsive" style={{ gap: '1rem', marginTop: 0 }}>
                                            <div className="form-group"><label className="label">Email</label><input className="input" name="email" type="email" defaultValue={editingItem?.email} /></div>
                                            <div className="form-group"><label className="label">Phone</label><input className="input" name="phone" defaultValue={editingItem?.phone} /></div>
                                        </div>
                                        <div className="form-group"><label className="label">Job Title</label><input className="input" name="jobTitle" defaultValue={editingItem?.jobTitle} /></div>
                                        <div className="form-group">
                                            <label className="label">Job Area</label>
                                            <select className="input" name="jobAreaId" defaultValue={editingItem?.jobArea?.id}>
                                                <option value="">Select Job Area</option>
                                                {jobAreas.map(ja => <option key={ja.id} value={ja.id}>{ja.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group"><label className="label">Hourly Rate ($)</label><input className="input" name="hourlyRate" type="number" step="0.01" defaultValue={editingItem?.hourlyRate} /></div>
                                    </>
                                )}
                                {modalType === 'jobArea' && (
                                    <div className="form-group"><label className="label">Area Name</label><input className="input" name="name" placeholder="e.g. Kitchen, Floor, Bar" required /></div>
                                )}
                                {modalType === 'shift' && (
                                    <>
                                        <div className="form-group">
                                            <label className="label">Staff Member</label>
                                            <select className="input" name="staffId" defaultValue={editingItem?.staff?.id} required>
                                                <option value="">Select Staff</option>
                                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Job Area</label>
                                            <select className="input" name="jobAreaId" defaultValue={editingItem?.jobArea?.id} required>
                                                <option value="">Select Area</option>
                                                {jobAreas.map(ja => <option key={ja.id} value={ja.id}>{ja.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group"><label className="label">Start Time</label><input className="input" name="startTime" type="datetime-local" defaultValue={editingItem?.startTime?.slice(0, 16)} required /></div>
                                        <div className="form-group"><label className="label">End Time</label><input className="input" name="endTime" type="datetime-local" defaultValue={editingItem?.endTime} required /></div>
                                    </>
                                )}
                                {modalType === 'invoice' && (
                                    <div className="animate-in" style={{ textAlign: 'center' }}>
                                        <div style={{
                                            border: '2px dashed var(--slate-200)',
                                            padding: '4rem 2rem',
                                            borderRadius: 'var(--radius-lg)',
                                            backgroundColor: 'var(--slate-50)',
                                            marginBottom: '2rem',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📄</div>
                                            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Drop your invoice here</h4>
                                            <p style={{ color: 'var(--slate-500)', marginBottom: '2rem' }}>Only PDF files are supported for AI parsing</p>

                                            <input
                                                type="file"
                                                name="file"
                                                accept="application/pdf"
                                                className="input"
                                                style={{ border: 'none', background: 'white', padding: '1rem', cursor: 'pointer' }}
                                                required
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', lineHeight: '1.6' }}>
                                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Google Gemini AI</span> will automatically extract supplier details, <br />
                                            dates, and itemized costs into your records.
                                        </p>
                                    </div>
                                )}
                                {modalType === 'invoice-review' && renderInvoiceReviewContent()}
                                {modalType === 'offer' && (
                                    <>
                                        <div className="form-group"><label className="label">Promo Code</label><input className="input" name="code" defaultValue={editingItem?.code} required /></div>
                                        <div className="form-group"><label className="label">Description</label><input className="input" name="description" defaultValue={editingItem?.description} /></div>
                                        <div className="form-group"><label className="label">Discount %</label><input className="input" name="discountPercentage" type="number" defaultValue={editingItem?.discountPercentage} required /></div>
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <input type="checkbox" name="active" defaultChecked={editingItem?.active ?? true} style={{ width: '20px', height: '20px' }} />
                                            <label className="label" style={{ margin: 0 }}>Offer is active</label>
                                        </div>
                                    </>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    {modalType === 'invoice-review' ? (
                                        <button type="button" className="btn btn-success" style={{ flex: 2 }} onClick={() => handleApproveInvoice(editingItem.id)}>
                                            ✅ Confirm & Approve
                                        </button>
                                    ) : (
                                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                                            {editingItem?.id ? 'Update' : 'Create'}
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
};

export default StoreDashboard;
