// src/pages/Community/Community.tsx
import React, { useState } from 'react';
import { CATEGORIES, type ForumThread, type Category, type ForumPost } from '../data/mockCommunity';
import '../assets/styles/Community.css';
import type { User } from '../App';

interface CommunityProps {
    user: User | null;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
    // Stan przechowujący wybraną kategorię
    const [selectedCategory, setSelectedCategory] = useState<Category>('Wszystkie');
    // Stan przechowujący wybrany wątek 
    const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
    // Stan do przechowywania wątków i postów w pamięci 
    const [threads, setThreads] = useState<ForumThread[]>([
        {
            thread_id: 't1',
            author_id: 'JanKowalski',
            title: 'Pomoc z całkami podwójnymi',
            content: 'Cześć, czy ktoś mógłby mi wytłumaczyć, jak wyznaczyć granice całkowania w zadaniu 3 z ostatniego kursu?',
            created_at: '2026-04-04T10:00:00Z',
            category: 'Matematyka'
        },
        {
            thread_id: 't2',
            author_id: 'AlaNowak',
            title: 'React vs Angular - co wybrać?',
            content: 'Zaczynam kurs frontendowy, zastanawiam się na czym się skupić. Co polecacie na start?',
            created_at: '2026-04-03T15:30:00Z',
            category: 'Programowanie'
        },
        {
            thread_id: 't3',
            author_id: 'PiotrM',
            title: 'Relacje w PostgreSQL',
            content: 'Jak najlepiej zoptymalizować zapytanie z trzema JOINami w naszej bazie?',
            created_at: '2026-04-04T08:15:00Z',
            category: 'Bazy danych'
        }
    ]);
    const [posts, setPosts] = useState<ForumPost[]>([
        {
            post_id: 'p1',
            thread_id: 't1',
            author_id: 'AnnaNauczyciel',
            content: 'Musisz najpierw narysować sobie obszar całkowania. Najlepiej zacząć od zmiennej, która ma stałe granice.',
            created_at: '2026-04-04T11:00:00Z'
        },
        {
            post_id: 'p2',
            thread_id: 't2',
            author_id: 'WojtekDev',
            content: 'React ma teraz większy rynek i świetne środowisko (jak np. Vite, którego używamy). Polecam Reacta!',
            created_at: '2026-04-03T16:00:00Z'
        }
    ]);

    // Stan do formularza tworzenia nowego wątku
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');
    const [newThreadCategory, setNewThreadCategory] = useState<Category>('Matematyka');
    const [showNewThreadForm, setShowNewThreadForm] = useState(false);

    // Stan do formularza dodawania odpowiedzi
    const [newReplyContent, setNewReplyContent] = useState('');

    // Filtrowanie wątków po kategorii
    const filteredThreads = selectedCategory === 'Wszystkie' 
        ? threads 
        : threads.filter(thread => thread.category === selectedCategory);

    // Odpowiedzi dla wybranego wątku
    const threadReplies = selectedThread 
        ? posts.filter(post => post.thread_id === selectedThread.thread_id) 
        : [];

    // Funkcja do tworzenia nowego wątku
    const handleCreateThread = () => {
        if (!user) {
            alert('Musisz być zalogowany, aby tworzyć wątki!');
            return;
        }

        if (!newThreadTitle.trim() || !newThreadContent.trim()) {
            alert('Tytuł i zawartość wątku nie mogą być puste!');
            return;
        }

        const newThread: ForumThread = {
            thread_id: `t${Date.now()}`,
            author_id: user.login,
            title: newThreadTitle,
            content: newThreadContent,
            created_at: new Date().toISOString(),
            category: newThreadCategory
        };

        setThreads([newThread, ...threads]);
        setNewThreadTitle('');
        setNewThreadContent('');
        setShowNewThreadForm(false);
    };

    // Funkcja do dodawania odpowiedzi
    const handleAddReply = () => {
        if (!user) {
            alert('Musisz być zalogowany, aby dodawać odpowiedzi!');
            return;
        }

        if (!selectedThread || !newReplyContent.trim()) {
            alert('Zawartość odpowiedzi nie może być pusta!');
            return;
        }

        const newPost: ForumPost = {
            post_id: `p${Date.now()}`,
            thread_id: selectedThread.thread_id,
            author_id: user.login,
            content: newReplyContent,
            created_at: new Date().toISOString()
        };

        setPosts([...posts, newPost]);
        setNewReplyContent('');
    };

    return (
        <div className="community-container">
            <aside className="community-sidebar">
                <h2>Kategorie</h2>
                <ul>
                    {CATEGORIES.map(category => (
                        <li 
                            key={category} 
                            className={selectedCategory === category ? 'active' : ''}
                            onClick={() => {
                                setSelectedCategory(category);
                                setSelectedThread(null); // Resetujemy wybrany wątek po zmianie kategorii
                            }}
                        >
                            {category}
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
                            <p className="meta">Autor: <strong>{selectedThread.author_id}</strong> | Kategoria: {selectedThread.category}</p>
                            <div className="content-body">{selectedThread.content}</div>
                        </div>

                        <h3>Odpowiedzi ({threadReplies.length})</h3>
                        <div className="replies-list">
                            {threadReplies.length > 0 ? (
                                threadReplies.map(reply => (
                                    <div key={reply.post_id} className="reply-card">
                                        <p className="meta">Odpowiedź od: <strong>{reply.author_id}</strong></p>
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
                        <h2>Wątki: {selectedCategory}</h2>
                        
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
                                    onChange={(e) => setNewThreadCategory(e.target.value as Category)}
                                    className="input-category"
                                >
                                    {CATEGORIES.filter(cat => cat !== 'Wszystkie').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
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
                                key={thread.thread_id} 
                                className="thread-card"
                                onClick={() => setSelectedThread(thread)}
                            >
                                <h3>{thread.title}</h3>
                                <p className="meta">Autor: {thread.author_id} | Utworzono: {new Date(thread.created_at).toLocaleDateString()} | Odpowiedzi: {posts.filter(p => p.thread_id === thread.thread_id).length}</p>
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