import React, { useState, useEffect } from 'react';
import api from '../api';
import '../assets/styles/Community.css'; // We will keep it but use inline styles mostly for WOW factor
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
    { label: 'Wszystkie', value: -1 },
    { label: 'Ogólne', value: 0 },
    { label: 'Feedback', value: 1 },
    { label: 'Wsparcie', value: 2 }
];

export default function Community() {
    const { user } = useAuth();
    
    const [selectedCategory, setSelectedCategory] = useState<number>(-1);
    const [selectedThread, setSelectedThread] = useState<any>(null);
    const [threads, setThreads] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');
    const [newThreadCategory, setNewThreadCategory] = useState<number>(0);
    const [showNewThreadForm, setShowNewThreadForm] = useState(false);
    
    const [newReplyContent, setNewReplyContent] = useState('');

    useEffect(() => {
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        try {
            const res = await api.get('/community/threads');
            setThreads(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchThreadDetails = async (id: string) => {
        try {
            const res = await api.get(`/community/threads/${id}`);
            setSelectedThread(res.data);
            setPosts(res.data.posts || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateThread = async () => {
        if (!user) {
            alert('Musisz być zalogowany, aby tworzyć wątki!');
            return;
        }

        if (!newThreadTitle.trim() || !newThreadContent.trim()) {
            alert('Tytuł i zawartość wątku nie mogą być puste!');
            return;
        }

        try {
            await api.post('/community/threads', {
                title: newThreadTitle,
                content: newThreadContent,
                category: newThreadCategory
            });
            setNewThreadTitle('');
            setNewThreadContent('');
            setShowNewThreadForm(false);
            fetchThreads();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddReply = async () => {
        if (!user) {
            alert('Musisz być zalogowany, aby dodawać odpowiedzi!');
            return;
        }

        if (!selectedThread || !newReplyContent.trim()) {
            alert('Zawartość odpowiedzi nie może być pusta!');
            return;
        }

        try {
            await api.post(`/community/threads/${selectedThread.id}/posts`, {
                content: newReplyContent
            });
            setNewReplyContent('');
            fetchThreadDetails(selectedThread.id);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredThreads = selectedCategory === -1 
        ? threads 
        : threads.filter(thread => thread.category === selectedCategory);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pl-PL', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', paddingTop: '100px', paddingBottom: '4rem', fontFamily: "'Inter', sans-serif" }}>
            <div className="container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                
                {/* SIDEBAR */}
                <aside style={{ flex: '0 0 250px', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', alignSelf: 'flex-start' }}>
                    <h2 style={{ margin: '0 0 1.5rem 0', color: '#f1f5f9', fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>Kategorie</h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {CATEGORIES.map(cat => (
                            <li 
                                key={cat.value} 
                                style={{ 
                                    padding: '0.8rem 1rem', 
                                    borderRadius: '10px', 
                                    cursor: 'pointer', 
                                    transition: 'all 0.2s ease',
                                    backgroundColor: selectedCategory === cat.value ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                                    color: selectedCategory === cat.value ? '#38bdf8' : '#cbd5e1',
                                    fontWeight: selectedCategory === cat.value ? 600 : 400,
                                    border: selectedCategory === cat.value ? '1px solid #38bdf8' : '1px solid transparent'
                                }}
                                onClick={() => {
                                    setSelectedCategory(cat.value);
                                    setSelectedThread(null);
                                    setShowNewThreadForm(false);
                                }}
                                onMouseOver={e => { if (selectedCategory !== cat.value) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                                onMouseOut={e => { if (selectedCategory !== cat.value) e.currentTarget.style.backgroundColor = 'transparent' }}
                            >
                                {cat.label}
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* MAIN CONTENT */}
                <main style={{ flex: '1', minWidth: '350px' }}>
                    {selectedThread ? (
                        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                            <button 
                                onClick={() => setSelectedThread(null)}
                                style={{ marginBottom: '1.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseOver={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                                onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#475569'; }}
                            >
                                &larr; Wróć do listy
                            </button>
                            
                            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2.5rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h1 style={{ margin: 0, fontSize: '2.2rem', color: '#f1f5f9', fontWeight: 800 }}>{selectedThread.title}</h1>
                                    <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                        {CATEGORIES.find(c => c.value === selectedThread.category)?.label}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                        {selectedThread.authorName ? selectedThread.authorName.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <span>Napisane przez <strong style={{ color: '#e2e8f0' }}>{selectedThread.authorName}</strong> • {formatDate(selectedThread.createdAt)}</span>
                                </div>
                                <div style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                                    {selectedThread.content}
                                </div>
                            </div>

                            <h3 style={{ margin: '0 0 1.5rem 0', color: '#f1f5f9', fontSize: '1.5rem' }}>Odpowiedzi ({posts.length})</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {posts.length > 0 ? (
                                    posts.map((reply: any) => (
                                        <div key={reply.id} style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '15px', border: '1px solid #1e293b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                    {reply.authorName ? reply.authorName.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <span><strong style={{ color: '#e2e8f0' }}>{reply.authorName}</strong> • {formatDate(reply.createdAt)}</span>
                                            </div>
                                            <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{reply.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '15px', color: '#64748b', border: '1px dashed #334155' }}>
                                        Brak odpowiedzi. Bądź pierwszy!
                                    </div>
                                )}
                            </div>

                            {user ? (
                                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#f1f5f9', fontSize: '1.2rem' }}>Dodaj odpowiedź</h4>
                                    <textarea
                                        value={newReplyContent}
                                        onChange={(e) => setNewReplyContent(e.target.value)}
                                        placeholder="Napisz coś mądrego..."
                                        rows={4}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9', marginBottom: '1rem', resize: 'vertical' }}
                                    />
                                    <button 
                                        onClick={handleAddReply} 
                                        style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)' }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        Wyslij Odpowiedź
                                    </button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '15px', color: '#94a3b8' }}>
                                    Zaloguj się, aby dodać odpowiedź
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '2rem' }}>
                                    Wątki: <span style={{ color: '#38bdf8' }}>{CATEGORIES.find(c => c.value === selectedCategory)?.label}</span>
                                </h2>
                                
                                {user ? (
                                    <button 
                                        onClick={() => setShowNewThreadForm(!showNewThreadForm)}
                                        style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', background: showNewThreadForm ? 'transparent' : 'linear-gradient(135deg, #10b981, #059669)', borderStyle: showNewThreadForm ? 'solid' : 'none', borderWidth: '1px', borderColor: '#ef4444', color: showNewThreadForm ? '#ef4444' : 'white', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        {showNewThreadForm ? '✖ Anuluj' : '✎ Nowy Wątek'}
                                    </button>
                                ) : (
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Zaloguj się, aby tworzyć wątki</span>
                                )}
                            </div>

                            {showNewThreadForm && user && (
                                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '20px', border: '1px solid #3b82f6', backdropFilter: 'blur(10px)', marginBottom: '2rem', animation: 'slideDown 0.3s ease-out' }}>
                                    <h3 style={{ margin: '0 0 1.5rem 0', color: '#f1f5f9' }}>Utwórz nowy wątek</h3>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <input
                                            type="text"
                                            value={newThreadTitle}
                                            onChange={(e) => setNewThreadTitle(e.target.value)}
                                            placeholder="Tytuł wątku..."
                                            style={{ flex: 2, padding: '1rem', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9' }}
                                        />
                                        <select
                                            value={newThreadCategory}
                                            onChange={(e) => setNewThreadCategory(Number(e.target.value))}
                                            style={{ flex: 1, padding: '1rem', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9' }}
                                        >
                                            {CATEGORIES.filter(cat => cat.value !== -1).map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <textarea
                                        value={newThreadContent}
                                        onChange={(e) => setNewThreadContent(e.target.value)}
                                        placeholder="Treść wątku..."
                                        rows={6}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9', marginBottom: '1rem', resize: 'vertical' }}
                                    />
                                    <button 
                                        onClick={handleCreateThread} 
                                        style={{ padding: '1rem 2rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        Opublikuj Wątek
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filteredThreads.map(thread => (
                                    <div 
                                        key={thread.id} 
                                        onClick={() => fetchThreadDetails(thread.id)}
                                        style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '1.5rem', borderRadius: '15px', border: '1px solid #1e293b', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: '10px' }}
                                        onMouseOver={e => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                                        onMouseOut={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.25rem' }}>{thread.title}</h3>
                                            <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {CATEGORIES.find(c => c.value === thread.category)?.label}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.6rem' }}>
                                                {thread.authorName ? thread.authorName.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span><strong>{thread.authorName}</strong> • {formatDate(thread.createdAt)}</span>
                                        </div>
                                    </div>
                                ))}

                                {filteredThreads.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'rgba(30, 41, 59, 0.3)', borderRadius: '20px', color: '#64748b', border: '1px dashed #334155' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#94a3b8' }}>Brak wątków</h3>
                                        <p style={{ margin: 0 }}>Nie znaleziono żadnych dyskusji w tej kategorii.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}