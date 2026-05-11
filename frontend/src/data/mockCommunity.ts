// src/data/mockCommunity.ts

export type Category = 'Wszystkie' | 'Matematyka' | 'Programowanie' | 'Bazy danych';

export interface ForumThread {
    thread_id: string;
    author_id: string;
    title: string;
    content: string;
    created_at: string;
    category: string;
}

export interface ForumPost {
    post_id: string;
    thread_id: string;
    author_id: string;
    content: string;
    created_at: string;
}

export const CATEGORIES: Category[] = ['Wszystkie', 'Matematyka', 'Programowanie', 'Bazy danych'];

export const MOCK_THREADS: ForumThread[] = [
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
];

export const MOCK_POSTS: ForumPost[] = [
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
];