import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const KnowledgeBase = () => {
    const { user } = useContext(AuthContext);
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (user?.storeId) fetchDocuments();
    }, [user]);

    const fetchDocuments = async () => {
        try {
            const response = await api.get(`/documents?storeId=${user.storeId}`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        console.log("Upload button clicked. File:", file, "User StoreId:", user?.storeId);
        if (!file) {
            alert("Please select a PDF file first.");
            return;
        }
        if (!user?.storeId) {
            alert("Store ID is missing. Please ensure your store profile is completely set up.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('storeId', user.storeId);

        try {
            await api.post('/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setFile(null);
            document.getElementById('fileInput').value = '';
            fetchDocuments();
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Upload failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="animate-in">

            {/* Upload Section */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Upload New Document</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        id="fileInput"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="input"
                        style={{ flex: 1, padding: '0.5rem' }}
                    />
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`btn ${!file || uploading ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ minWidth: '150px' }}
                    >
                        {uploading ? 'Uploading...' : 'Upload PDF'}
                    </button>
                </div>
                <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                    Supported format: PDF. Documents will be indexed for AI retrieval.
                </p>
            </div>

            {/* Documents List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Filename</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Upload Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                                <td style={{ padding: '1rem' }}>{doc.filename}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`badge ${doc.status === 'INDEXED' ? 'badge-success' :
                                        doc.status === 'FAILED' ? 'badge-danger' :
                                            'badge-warning'
                                        }`}>
                                        {doc.status}
                                    </span>
                                    {doc.status === 'FAILED' && doc.errorMessage && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.25rem' }}>
                                            {doc.errorMessage}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--slate-500)' }}>
                                    {new Date(doc.uploadDate).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {documents.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                                    No documents uploaded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KnowledgeBase;
