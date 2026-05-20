import React, { useState, useEffect } from 'react';
import api from '../api';
import '../assets/styles/Community.css';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
    { label: 'Wszystkie', value: -1 },
    { label: 'Ogólne', value: 0 },
    { label: 'Feedback', value: 1 },
    { label: 'Wsparcie', value: 2 }
];

const Community: React.FC = () => {
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
            setThreads(res.data);
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

    return (
        <div className="community-container">
            <aside className="community-sidebar">
                <h2>Kategorie</h2>
                <ul>
                    {CATEGORIES.map(cat => (
                        <li 
                            key={cat.value} 
                            className={selectedCategory === cat.value ? 'active' : ''}
                            onClick={() => {
                                setSelectedCategory(cat.value);
                                setSelectedThread(null);
                            }}
                        >
                            {cat.label}
                        </li>
                    ))}
                </ul>
            </aside>

            <main className="community-content">
                {selectedThread ? (
                    <div className="thread-detail">
                        <button className="back-btn" onClick={() => setSelectedThread(null)}>
                            &larr; Wróć do listy
                        </button>
                        
                        <div className="original-post">
                            <h1>{selectedThread.title}</h1>
                            <p className="meta">Kategoria: {CATEGORIES.find(c => c.value === selectedThread.category)?.label}</p>
                            <div className="content-body">{selectedThread.content}</div>
                        </div>

                        <h3>Odpowiedzi ({posts.length})</h3>
                        <div className="replies-list">
                            {posts.length > 0 ? (
                                posts.map(reply => (
                                    <div key={reply.id} className="reply-card">
                                        <p>{reply.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p>Brak odpowiedzi. Bądź pierwszy!</p>
                            )}
                        </div>

                        {user ? (
                            <div className="reply-form">
                                <h4>Dodaj odpowiedź</h4>
                                <textarea
                                    value={newReplyContent}
                                    onChange={(e) => setNewReplyContent(e.target.value)}
                                    placeholder="Wpisz swoją odpowiedź..."
                                    rows={4}
                                />
                                <button onClick={handleAddReply} className="btn-primary">Wyślij odpowiedź</button>
                            </div>
                        ) : (
                            <p className="login-prompt">Zaloguj się, aby dodawać odpowiedzi</p>
                        )}
                    </div>
                ) : (
                    <div className="threads-list">
                        <h2>Wątki: {CATEGORIES.find(c => c.value === selectedCategory)?.label}</h2>
                        
                        {user ? (
                            <button 
                                onClick={() => setShowNewThreadForm(!showNewThreadForm)}
                                className="btn-primary btn-create-thread"
                            >
                                {showNewThreadForm ? 'Anuluj' : '+ Nowy wątek'}
                            </button>
                        ) : (
                            <p className="login-prompt">Zaloguj się, aby tworzyć wątki</p>
                        )}

                        {showNewThreadForm && user && (
                            <div className="new-thread-form">
                                <h3>Utwórz nowy wątek</h3>
                                <input
                                    type="text"
                                    value={newThreadTitle}
                                    onChange={(e) => setNewThreadTitle(e.target.value)}
                                    placeholder="Tytuł wątku..."
                                    className="input-title"
                                />
                                <select
                                    value={newThreadCategory}
                                    onChange={(e) => setNewThreadCategory(Number(e.target.value))}
                                    className="input-category"
                                >
                                    {CATEGORIES.filter(cat => cat.value !== -1).map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                                <textarea
                                    value={newThreadContent}
                                    onChange={(e) => setNewThreadContent(e.target.value)}
                                    placeholder="Treść wątku..."
                                    rows={6}
                                    className="input-content"
                                />
                                <button onClick={handleCreateThread} className="btn-primary">Utwórz wątek</button>
                            </div>
                        )}

                        {filteredThreads.map(thread => (
                            <div 
                                key={thread.id} 
                                className="thread-card"
                                onClick={() => fetchThreadDetails(thread.id)}
                            >
                                <h3>{thread.title}</h3>
                                <p className="meta">Kategoria: {CATEGORIES.find(c => c.value === thread.category)?.label} | Utworzono: {new Date(thread.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}

                        {filteredThreads.length === 0 && (
                            <p>Brak wątków w tej kategorii</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
export default Community;