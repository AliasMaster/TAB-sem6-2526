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
  },
  {
    id: '4',
    title: 'Node.js i Express: Backend od Zera',
    description: 'Buduj skalowalne API i systemy po stronie serwera.',
    longDescription: 'Zanurz się w świecie JavaScriptu po stronie serwera. Nauczysz się tworzyć RESTful API, pracować z bazami danych MongoDB oraz implementować systemy autoryzacji JWT.',
    author: 'Michał Zieliński',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop',
    category: 'Programowanie',
    rating: 4.6,
    modules: [
      {
        id: 'nm1',
        title: 'Architektura REST',
        lessons: [{ id: 'nl1', title: 'Podstawy protokołu HTTP', durationMinutes: 15 }]
      }
    ]
  },
  {
    id: '5',
    title: 'UI/UX Design Essentials',
    description: 'Zasady tworzenia intuicyjnych i estetycznych interfejsów.',
    longDescription: 'Dowiedz się, jak projektować doświadczenia użytkownika, które zachwycają. Kurs obejmuje naukę Figmy, tworzenie prototypów oraz zasady typografii i teorii koloru.',
    author: 'Katarzyna Mazur',
    price: 320,
    imageUrl: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXglMjBkZXNpZ258ZW58MHx8MHx8fDA%3D',
    category: 'Design',
    rating: 4.9,
    modules: [
      {
        id: 'dm1',
        title: 'Prototypowanie w Figmie',
        lessons: [{ id: 'dl1', title: 'Interaktywne komponenty', durationMinutes: 40 }]
      }
    ]
  },
  {
    id: '6',
    title: 'Python w Analizie Danych',
    description: 'Wykorzystaj biblioteki Pandas i NumPy do pracy z danymi.',
    longDescription: 'Przekształć surowe dane w wartościowe wnioski. Nauczysz się manipulacji danymi, czyszczenia zbiorów oraz podstaw wizualizacji przy użyciu Matplotlib i Seaborn.',
    author: 'Tomasz Lewandowski',
    price: 279,
    imageUrl: 'https://justjoin.it/blog/storage/2021/10/hitesh-choudhary-D9Zow2REm8U-unsplash.jpg',
    category: 'Data Science',
    rating: 4.5,
    modules: [
      {
        id: 'pm1',
        title: 'Wstęp do Pandas',
        lessons: [{ id: 'pl1', title: 'DataFrames i Series', durationMinutes: 30 }]
      }
    ]
  },
  {
    id: '7',
    title: 'Marketing Cyfrowy i SEO',
    description: 'Zwiększ widoczność swojej marki w sieci.',
    longDescription: 'Praktyczny poradnik po świecie reklamy online. Dowiesz się, jak optymalizować strony pod Google, prowadzić kampanie Facebook Ads i analizować ruch w Google Analytics 4.',
    author: 'Robert Król',
    price: 189,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    category: 'Marketing',
    rating: 4.4,
    modules: [
      {
        id: 'sm1',
        title: 'Podstawy SEO',
        lessons: [{ id: 'sl1', title: 'Słowa kluczowe i intencja użytkownika', durationMinutes: 20 }]
      }
    ]
  },
  {
    id: '8',
    title: 'Cyberbezpieczeństwo dla Każdego',
    description: 'Chroń swoje dane i poznaj techniki hakerskie.',
    longDescription: 'Dowiedz się, jak działają współczesne ataki i jak się przed nimi bronić. Kurs obejmuje bezpieczne zarządzanie hasłami, rozpoznawanie phishingu oraz zabezpieczanie sieci domowych.',
    author: 'Marek Wójcik',
    price: 210,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    category: 'Bezpieczeństwo',
    rating: 4.9,
    modules: [
      {
        id: 'cm1',
        title: 'Zagrożenia w sieci',
        lessons: [{ id: 'cl1', title: 'Socjotechnika w praktyce', durationMinutes: 18 }]
      }
    ]
  }
];