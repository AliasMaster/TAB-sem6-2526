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
  },
  {
    id: '9',
    title: 'Zarządzanie Czasem i Produktywność',
    description: 'Zrób więcej w krótszym czasie bez wypalenia zawodowego.',
    longDescription: 'Poznaj sprawdzone techniki planowania, priorytetyzacji (m.in. macierz Eisenhowera) oraz metody walki z prokrastynacją. Odzyskaj kontrolę nad swoim kalendarzem i życiem.',
    author: 'Kamil Majewski',
    price: 129,
    imageUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop',
    category: 'Biznes',
    rating: 4.8,
    modules: [
      {
        id: 'biz1_m1',
        title: 'Audyt Twojego Czasu',
        lessons: [{ id: 'biz1_l1', title: 'Gdzie uciekają Twoje godziny?', durationMinutes: 20 }]
      }
    ]
  },
  {
    id: '10',
    title: 'Mistrz Włoskiej Kuchni',
    description: 'Naucz się gotować jak prawdziwy włoski szef kuchni we własnym domu.',
    longDescription: 'Od idealnego ciasta na pizzę po domowy makaron i klasyczne sosy. Ten kurs krok po kroku wprowadzi Cię w świat aromatycznej i prostej kuchni śródziemnomorskiej.',
    author: 'Marco Rossi',
    price: 199,
    imageUrl: 'https://i.gremicdn.pl/image/free/be0431293c251278b0ca557aaa6c97d0/?t=crop:1200:744:nowe:0:28,resize:fill:948:593,enlarge:1',
    category: 'Kulinaria',
    rating: 4.9,
    modules: [
      {
        id: 'kul1_m1',
        title: 'Sekrety ciasta',
        lessons: [{ id: 'kul1_l1', title: 'Prawdziwa neapolitańska pizza', durationMinutes: 45 }]
      }
    ]
  },
  {
    id: '11',
    title: 'Podstawy Gry na Gitarze Klasycznej',
    description: 'Zagraj swoją pierwszą piosenkę już po pierwszej lekcji.',
    longDescription: 'Nigdy nie trzymałeś gitary w rękach? To kurs dla Ciebie. Nauczysz się strojenia, podstawowych akordów, bicia oraz czytania tabulatur bez konieczności znania nut.',
    author: 'Piotr Kaczmarek',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop',
    category: 'Muzyka',
    rating: 4.7,
    modules: [
      {
        id: 'muz1_m1',
        title: 'Pierwsze kroki',
        lessons: [{ id: 'muz1_l1', title: 'Budowa instrumentu i postawa', durationMinutes: 15 }]
      }
    ]
  },
  {
    id: '12',
    title: 'Inwestowanie na Giełdzie dla Bystrzaków',
    description: 'Zrozum rynki finansowe i zacznij budować swój kapitał.',
    longDescription: 'Praktyczne wprowadzenie do świata akcji, obligacji i ETF-ów. Nauczysz się analizować spółki, zarządzać ryzykiem i budować długoterminowy portfel inwestycyjny bez stresu.',
    author: 'Marta Zawadzka',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
    category: 'Finanse',
    rating: 4.6,
    modules: [
      {
        id: 'fin1_m1',
        title: 'Podstawy Rynku',
        lessons: [{ id: 'fin1_l1', title: 'Czym są akcje i jak powstaje cena?', durationMinutes: 25 }]
      }
    ]
  },
  {
    id: '13',
    title: 'Wystąpienia Publiczne i Retoryka',
    description: 'Pokonaj stres i mów tak, by inni chcieli Cię słuchać.',
    longDescription: 'Jak radzić sobie z tremą, używać mowy ciała i modulować głos? Ten kurs to skarbnica wiedzy dla każdego, kto chce błyszczeć na scenie, w sali konferencyjnej lub na wideo.',
    author: 'Adam Sadowski',
    price: 179,
    imageUrl: 'https://api.dorada.uj.edu.pl//library/big/2021-05-20-78agdmqlbc8odNGriTjdT0PzjHP2hO.png',
    category: 'Rozwój Osobisty',
    rating: 4.9,
    modules: [
      {
        id: 'roz1_m1',
        title: 'Fundamenty Pewności Siebie',
        lessons: [{ id: 'roz1_l1', title: 'Praca z oddechem i przeponą', durationMinutes: 20 }]
      }
    ]
  },
  {
    id: '14',
    title: 'Fotografia Portretowa w Świetle Zastanym',
    description: 'Rób magiczne portrety bez drogiego sprzętu studyjnego.',
    longDescription: 'Wykorzystaj okno, słońce i cienie do tworzenia niesamowitych kadrów. Dowiesz się, jak pracować z modelką, dobierać obiektywy i edytować zdjęcia w Lightroomie.',
    author: 'Julia Rutkowska',
    price: 210,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
    category: 'Fotografia',
    rating: 4.8,
    modules: [
      {
        id: 'fot1_m1',
        title: 'Zrozumieć Światło',
        lessons: [{ id: 'fot1_l1', title: 'Złota godzina a światło z okna', durationMinutes: 30 }]
      }
    ]
  },
  {
    id: '15',
    title: 'Joga dla Początkujących: Ciało i Umysł',
    description: 'Zbuduj elastyczność i wycisz umysł w 30 dni.',
    longDescription: 'Bezpieczne wprowadzenie do asan. Poprawisz swoją postawę, zredukujesz ból pleców i nauczysz się technik relaksacyjnych idealnych po ciężkim dniu pracy.',
    author: 'Elena Kova',
    price: 119,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
    category: 'Zdrowie i Fitness',
    rating: 4.9,
    modules: [
      {
        id: 'zdr1_m1',
        title: 'Pierwsze Asany',
        lessons: [{ id: 'zdr1_l1', title: 'Powitanie słońca krok po kroku', durationMinutes: 25 }]
      }
    ]
  },
  {
    id: '16',
    title: 'Hiszpański w Podróży',
    description: 'Dogadaj się na wakacjach w Hiszpanii i Ameryce Łacińskiej.',
    longDescription: 'Praktyczne słownictwo, zamawianie jedzenia, pytanie o drogę i radzenie sobie w nagłych sytuacjach. Kurs nastawiony na mówienie, z pominięciem trudnej gramatyki.',
    author: 'Carlos Mendes',
    price: 89,
    imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=800&auto=format&fit=crop',
    category: 'Języki',
    rating: 4.5,
    modules: [
      {
        id: 'jez1_m1',
        title: 'Na lotnisku i w hotelu',
        lessons: [{ id: 'jez1_l1', title: 'Odprawa i rezerwacja pokoju', durationMinutes: 18 }]
      }
    ]
  },
  {
    id: '17',
    title: 'Sztuka Negocjacji Biznesowych',
    description: 'Osiągaj lepsze warunki i buduj trwałe relacje.',
    longDescription: 'Jak rozmawiać o podwyżce, negocjować umowy z klientami i radzić sobie z trudnymi partnerami? Poznaj taktyki FBI i najlepszych sprzedawców.',
    author: 'Dawid Kostecki',
    price: 250,
    imageUrl: 'https://vade.com.pl/wp-content/uploads/2024/03/mediensturmer-awf7mjwwjjo-unsplash-1624x1050.jpg',
    category: 'Biznes',
    rating: 4.7,
    modules: [
      {
        id: 'biz2_m1',
        title: 'Przygotowanie do negocjacji',
        lessons: [{ id: 'biz2_l1', title: 'Ustalanie BATNA i punktu oporu', durationMinutes: 22 }]
      }
    ]
  },
  {
    id: '18',
    title: 'Akwarele dla Początkujących',
    description: 'Odkryj w sobie artystę i naucz się malować wodą i kolorem.',
    longDescription: 'Poznaj techniki "mokre na mokre", blendowanie kolorów oraz zasady kompozycji. Stworzysz własne, piękne pejzaże i ilustracje florystyczne.',
    author: 'Zofia Dąbrowska',
    price: 139,
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
    category: 'Sztuka',
    rating: 4.8,
    modules: [
      {
        id: 'szt1_m1',
        title: 'Narzędzia i Materiały',
        lessons: [{ id: 'szt1_l1', title: 'Wybór papieru i pędzli', durationMinutes: 12 }]
      }
    ]
  },
  {
    id: '19',
    title: 'Copywriting Sprzedażowy',
    description: 'Pisz teksty, które konwertują i przynoszą zyski.',
    longDescription: 'Od chwytliwych nagłówków, przez maile sprzedażowe, aż po pełne landing page. Dowiesz się, jak używać psychologii w pisaniu i jak tworzyć opowieści (storytelling).',
    author: 'Tomasz Lis',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1726831662518-c48d983f9b86?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29weXdyaXRpbmd8ZW58MHx8MHx8fDA%3D',
    category: 'Marketing',
    rating: 4.6,
    modules: [
      {
        id: 'mar1_m1',
        title: 'Formuły Copywriterskie',
        lessons: [{ id: 'mar1_l1', title: 'Zastosowanie modelu AIDA', durationMinutes: 20 }]
      }
    ]
  },
  {
    id: '20',
    title: 'Home Barista: Sztuka Parzenia Kawy',
    description: 'Wyciągnij maksimum smaku z każdego ziarna.',
    longDescription: 'Espresso, V60, Chemex czy Aeropress? Nauczysz się ustawiać młynek, rozpoznawać defekty smaku, a nawet tworzyć podstawowe wzory latte art w domu.',
    author: 'Michał Kawa',
    price: 110,
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
    category: 'Kulinaria',
    rating: 4.9,
    modules: [
      {
        id: 'kul2_m1',
        title: 'Ekstrakcja idealna',
        lessons: [{ id: 'kul2_l1', title: 'Znaczenie grubości mielenia i temperatury', durationMinutes: 18 }]
      }
    ]
  },
  {
    id: '21',
    title: 'Animacja 3D w Blenderze',
    description: 'Stwórz swoje pierwsze animacje i modele w darmowym programie.',
    longDescription: 'Krok po kroku przez interfejs Blendera. Modelowanie, teksturowanie, oświetlenie i wreszcie – renderowanie własnej, w pełni trójwymiarowej sceny.',
    author: 'Krzysztof Wrona',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    category: 'Design',
    rating: 4.7,
    modules: [
      {
        id: 'des1_m1',
        title: 'Podstawy Interfejsu',
        lessons: [{ id: 'des1_l1', title: 'Nawigacja w przestrzeni 3D', durationMinutes: 25 }]
      }
    ]
  },
  {
    id: '22',
    title: 'Angielski Biznesowy (Poziom B2/C1)',
    description: 'Błyszcz na międzynarodowych spotkaniach i w mailach.',
    longDescription: 'Słownictwo korporacyjne, idiomy biznesowe i sztuka kulturalnego nie zgadzania się z rozmówcą. Kurs zawiera liczne case studies i symulacje rozmów.',
    author: 'Emma Smith',
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
    category: 'Języki',
    rating: 4.6,
    modules: [
      {
        id: 'jez2_m1',
        title: 'Prowadzenie Spotkań',
        lessons: [{ id: 'jez2_l1', title: 'Otwieranie spotkania i przydzielanie głosu', durationMinutes: 20 }]
      }
    ]
  },
  {
    id: '23',
    title: 'Pozytywne Szkolenie Psów',
    description: 'Zbuduj więź i naucz psa posłuszeństwa bez krzyku.',
    longDescription: 'Jak działa psi umysł? Naucz się używać klikera, budować motywację do pracy i rozwiązywać problemy behawioralne, takie jak ciągnięcie na smyczy.',
    author: 'Agnieszka Wilk',
    price: 159,
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
    category: 'Zwierzęta',
    rating: 4.9,
    modules: [
      {
        id: 'zwi1_m1',
        title: 'Fundamenty Komunikacji',
        lessons: [{ id: 'zwi1_l1', title: 'Mowa ciała psa - sygnały uspokajające', durationMinutes: 30 }]
      }
    ]
  },
  {
    id: '24',
    title: 'Jak Napisać i Wydać Książkę',
    description: 'Od pustej kartki do własnego nazwiska na okładce.',
    longDescription: 'Proces twórczy, kreacja bohaterów, budowanie napięcia oraz praktyczne porady dotyczące kontaktu z wydawnictwami i self-publishingu na Amazon KDP.',
    author: 'Wojciech Pisarski',
    price: 199,
    imageUrl: 'https://papierowymotyl.pl/wp-content/uploads/2021/11/sincerely-media-nGrfKmtwv24-unsplash-scaled.jpg',
    category: 'Rozwój Osobisty',
    rating: 4.5,
    modules: [
      {
        id: 'pis1_m1',
        title: 'Planowanie fabuły',
        lessons: [{ id: 'pis1_l1', title: 'Struktura trójaktowa i podróż bohatera', durationMinutes: 35 }]
      }
    ]
  },
  {
    id: '25',
    title: 'Produkcja Muzyki w Ableton Live',
    description: 'Twórz własne bity i utwory od zera do gotowego mastera.',
    longDescription: 'Poznaj środowisko DAW, syntezę dźwięku, sampling oraz podstawy miksu. Idealny kurs dla przyszłych producentów muzyki elektronicznej i hip-hopu.',
    author: 'DJ Kameleon',
    price: 279,
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
    category: 'Muzyka',
    rating: 4.8,
    modules: [
      {
        id: 'muz2_m1',
        title: 'Widok Sesji vs Aranżacji',
        lessons: [{ id: 'muz2_l1', title: 'Organizacja śladów i budowa loopa', durationMinutes: 40 }]
      }
    ]
  },
  {
    id: '26',
    title: 'Mindfulness i Redukcja Stresu',
    description: 'Znajdź spokój w pędzącym świecie dzięki uważności.',
    longDescription: 'Praktyczne techniki medytacji oparte na naukowych dowodach (MBSR). Naucz się radzić sobie z gonitwą myśli, popraw koncentrację i śpij głębiej.',
    author: 'Dr Ewa Cicha',
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=800&auto=format&fit=crop',
    category: 'Zdrowie i Fitness',
    rating: 4.9,
    modules: [
      {
        id: 'zdr2_m1',
        title: 'Podstawy Uważności',
        lessons: [{ id: 'zdr2_l1', title: 'Skanowanie ciała (Body Scan)', durationMinutes: 45 }]
      }
    ]
  },
  {
    id: '27',
    title: 'Trening Siłowy w Domu',
    description: 'Zbuduj formę używając tylko masy własnego ciała.',
    longDescription: 'Plany treningowe kalisteniki, odpowiednia technika wykonywania pompek, przysiadów i podciągania, oraz podstawy dietetyki sportowej dla początkujących.',
    author: 'Maciej Fit',
    price: 99,
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    category: 'Zdrowie i Fitness',
    rating: 4.6,
    modules: [
      {
        id: 'fit1_m1',
        title: 'Fundamenty Ruchu',
        lessons: [{ id: 'fit1_l1', title: 'Prawidłowa technika przysiadu', durationMinutes: 15 }]
      }
    ]
  },
  {
    id: '28',
    title: 'Ceramika w Domowym Zaciszu',
    description: 'Stwórz własne kubki i misy bez użycia koła garncarskiego.',
    longDescription: 'Poznaj techniki lepienia z wałeczków, szczypania i plastrów. Kurs obejmuje również wiedzę o wypalaniu, szkliwieniu i dbaniu o własnoręcznie zrobione naczynia.',
    author: 'Anna Glina',
    price: 169,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
    category: 'Sztuka',
    rating: 4.7,
    modules: [
      {
        id: 'szt2_m1',
        title: 'Zapoznanie z gliną',
        lessons: [{ id: 'szt2_l1', title: 'Technika szczypania (Pinch pot)', durationMinutes: 25 }]
      }
    ]
  }
];