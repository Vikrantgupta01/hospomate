import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const ChatInterface = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I can help you with your store's knowledge base. What would you like to know?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Using the ChatController endpoint: /api/chat?message=...&storeId=...
            const response = await api.get('/chat', {
                params: {
                    message: userMessage.content,
                    storeId: user.storeId
                }
            });

            // The backend returns just the string answer according to ChatController.java
            // unless it was changed to return JSON. Let's assume string based on typical implementation
            // but handle object just in case.
            const responseText = typeof response.data === 'string'
                ? response.data
                : (response.data?.response || response.data?.answer || "I received an empty response.");

            const assistantMessage = {
                role: 'assistant',
                content: responseText
            };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error while processing your request. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px', overflow: 'hidden', border: '1px solid var(--slate-200)', padding: 0 }}>
            <div style={{ padding: '1rem', background: 'var(--primary)', color: 'white', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0 }}>AI Assistant</h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Ask about store knowledge, manuals, or standard procedures</p>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg)' }}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                    >
                        <div
                            style={{
                                maxWidth: '80%',
                                padding: '0.5rem 1rem',
                                borderRadius: '1rem',
                                borderBottomRightRadius: msg.role === 'user' ? 0 : '1rem',
                                borderBottomLeftRadius: msg.role === 'user' ? '1rem' : 0,
                                background: msg.role === 'user' ? 'var(--primary)' : 'white',
                                color: msg.role === 'user' ? 'white' : 'var(--slate-800)',
                                border: msg.role === 'user' ? 'none' : '1px solid var(--slate-200)',
                                boxShadow: msg.role === 'user' ? 'none' : 'var(--shadow-sm)'
                            }}
                        >
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ background: 'white', border: '1px solid var(--slate-200)', padding: '0.75rem', borderRadius: '1rem', borderBottomLeftRadius: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="spinner" style={{ width: '15px', height: '15px', borderWidth: '3px' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '1rem', background: 'white', borderTop: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        className="input"
                        style={{ flex: 1, borderRadius: '999px', padding: '0.5rem 1rem' }}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="btn btn-primary btn-pill"
                        style={{ padding: '0.5rem 1.5rem', opacity: (loading || !input.trim()) ? 0.5 : 1 }}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;
