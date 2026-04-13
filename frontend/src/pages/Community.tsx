// src/pages/Community/Community.tsx
import React, { useState } from 'react';
import { CATEGORIES, MOCK_THREADS, MOCK_POSTS, type ForumThread, type Category } from '../data/mockCommunity';
import './Community.css';

const Community: React.FC = () => {
    // Stan przechowujący wybraną kategorię
    const [selectedCategory, setSelectedCategory] = useState<Category>('Wszystkie');
    // Stan przechowujący wybrany wątek (jeśli null, to znaczy że jesteśmy w widoku listy)
    const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);

    // Filtrowanie wątków po kategorii
    const filteredThreads = selectedCategory === 'Wszystkie' 
        ? MOCK_THREADS 
        : MOCK_THREADS.filter(thread => thread.category === selectedCategory);

    // Odpowiedzi dla wybranego wątku
    const threadReplies = selectedThread 
        ? MOCK_POSTS.filter(post => post.thread_id === selectedThread.thread_id) 
        : [];

    return (
        <div className="community-container">
            {/* LEWA STRONA: Pasek nawigacji / Kategorie */}
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

            {/* PRAWA STRONA: Zawartość (Lista wątków LUB Szczegóły wątku) */}
            <main className="community-content">
                {selectedThread ? (
                    // WIDOK SZCZEGÓŁÓW WĄTKU
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
                    </div>
                ) : (
                    // WIDOK LISTY WĄTKÓW
                    <div className="threads-list">
                        <h2>Wątki: {selectedCategory}</h2>
                        {filteredThreads.map(thread => (
                            <div 
                                key={thread.thread_id} 
                                className="thread-card"
                                onClick={() => setSelectedThread(thread)}
                            >
                                <h3>{thread.title}</h3>
                                <p className="meta">Autor: {thread.author_id} | Utworzono: {new Date(thread.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
export default Community;