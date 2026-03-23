import type { Course } from './types';

// Udawana baza danych kursów online - zaktualizowana do pełnej szerokości i nowoczesnego wyglądu
export const courses: Course[] = [
  {
    id: '1', // Poprawione na string
    title: 'React od Podstaw',
    description: 'Zbuduj swoje pierwsze aplikacje w React.js krok po kroku.',
    longDescription: 'Kompletny kurs React.js dla początkujących. Nauczysz się budować dynamiczne interfejsy, zarządzać stanem za pomocą Hooków i komunikować się z zewnętrznymi API.',
    author: 'Jan Kowalski',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    category: 'Programowanie',
    rating: 4.8,
    modules: [
      {
        id: 'm1',
        title: 'Wprowadzenie',
        lessons: [{ id: 'l1', title: 'Konfiguracja środowiska', durationMinutes: 10 }]
      }
    ]
  },
  {
    id: '2', // Poprawione na string
    title: 'TypeScript dla Zaawansowanych',
    description: 'Opanuj system typów, interfejsy i generyki w TypeScript.',
    longDescription: 'Zmień swój kod JavaScript w bezpieczną i skalowalną architekturę. Kurs obejmuje zaawansowane typy, dekoratory oraz integrację z popularnymi frameworkami.',
    author: 'Anna Nowak',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=800&auto=format&fit=crop',
    category: 'Development',
    rating: 4.9,
    modules: [
      {
        id: 'tm1',
        title: 'Generyki',
        lessons: [{ id: 'tl1', title: 'Tworzenie reużywalnych komponentów', durationMinutes: 25 }]
      }
    ]
  },
  {
    id: '3', // Poprawione na string
    title: 'Nowoczesny CSS i Tailwind',
    description: 'Twórz piękne i responsywne interfejsy w mgnieniu oka.',
    longDescription: 'Zapomnij o pisaniu tysięcy linii CSS. Dowiedz się, jak wykorzystać potęgę Tailwind CSS do błyskawicznego budowania stron, które wyglądają świetnie na każdym urządzeniu.',
    author: 'Piotr Wiśniewski',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop',
    category: 'Design',
    rating: 4.7
  }
];