# 🎓 TAB E-Learning Platform

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)
![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg?logo=dotnet)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Microservices-2496ED.svg?logo=docker)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-AMQP-FF6600.svg?logo=rabbitmq)

> **Multitematyczna platforma e-learningowa z modułem e-commerce i funkcjami społecznościowymi.**
> Projekt zrealizowany w ramach przedmiotu Tworzenie Aplikacji Bazodanowych (dr inż. Robert Brzeski). Aplikacja umożliwia przeglądanie oferty szkoleniowej, bezpieczny zakup kursów oraz natychmiastowy dostęp do powiązanych z nimi materiałów dydaktycznych.

---

## 📑 Spis Treści
- [Funkcjonalności](#-funkcjonalności)
- [Stack technologiczny](#-stack-technologiczny)
- [Instalacja i uruchomienie](#-instalacja-i-uruchomienie)
- [Zmienne środowiskowe](#-zmienne-środowiskowe)
- [Sposób użycia](#-sposób-użycia)
- [Autorzy](#-autorzy)
- [Licencja](#-licencja)

---

## ✨ Funkcjonalności

- 🔐 **Autoryzacja i Logowanie** – Bezpieczne uwierzytelnianie użytkowników z wykorzystaniem tokenów JWT.
- 📚 **Katalog Kursów** – Przeglądanie, wyszukiwanie i filtrowanie dostępnych szkoleń.
- 🛒 **Moduł E-commerce** – Koszyk zakupowy i obsługa zamówień kursów.
- 🎓 **Materiały Dydaktyczne** – Dostęp do zakupionych treści, śledzenie postępów w nauce.
- 💬 **Funkcje Społecznościowe** – Możliwość interakcji, oceniania i komentowania kursów.
- 📊 **Raportowanie** – Panel analityczny dla administratorów oraz twórców.
- 📁 **Obsługa Plików** – Dedykowany serwis do bezpiecznego przechowywania i serwowania materiałów wideo oraz dokumentów.

*[Tutaj wklej zrzut ekranu przedstawiający stronę główną aplikacji - np. `![Strona Główna](docs/home.png)`]*

---

## 🛠 Stack technologiczny

Projekt oparty o nowoczesną architekturę mikroserwisów, gwarantującą wysoką skalowalność i niezawodność.

### 🎨 Frontend
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Routing:** React Router v7
- **Komunikacja API:** Axios
- **Narzędzia UI:** React-Markdown, React-Player

### ⚙️ Backend (Architektura Mikroserwisów)
- **Technologia:** C# / .NET
- **API Gateway:** Centralny punkt wejścia dla zapytań klienckich
- **Serwisy:** Auth, Catalog, Order, Enrollment, Community, Report, FileStorage
- **Komunikacja asynchroniczna:** RabbitMQ (Event Bus)

### 🗄 Baza Danych i Infrastruktura
- **Baza danych:** PostgreSQL 15 (osobne schematy/użytkownicy dla mikroserwisów)
- **Konteneryzacja:** Docker & Docker Compose

---

## 🚀 Instalacja i uruchomienie

Aplikacja składa się z backendu uruchamianego w Dockerze oraz frontendu.

### 1. Klonowanie repozytorium
```bash
git clone https://github.com/AliasMaster/TAB-sem6-2526.git
cd TAB-sem6-2526
```

### 2. Uruchomienie Backendu (Docker)
Wymagany jest zainstalowany **Docker** oraz wtyczka **Docker Compose**.

```bash
cd backend
# 1. Skopiuj szablon zmiennych środowiskowych
cp .env.example .env

# 2. Uruchom wszystkie mikroserwisy, bazy danych oraz RabbitMQ
docker-compose up -d --build
```
> **Uwaga:** Pierwsze uruchomienie może chwilę potrwać (budowanie obrazów). API Gateway domyślnie nasłuchuje na zmapowanym porcie.

### 3. Uruchomienie Frontendu
Wymagane jest środowisko **Node.js** (zalecane v18+).

```bash
cd ../frontend
# 1. Zainstaluj zależności
npm install

# 2. Uruchom serwer deweloperski
npm run dev
```
Aplikacja frontendowa będzie dostępna w przeglądarce (domyślnie pod adresem: `http://localhost:5173`).

---

## 🔐 Zmienne środowiskowe (.env)

Aby backend działał poprawnie, konieczne jest skonfigurowanie zmiennych w pliku `backend/.env`. Szablon znajdziesz w `backend/.env.example`.

Najważniejsze zmienne do zdefiniowania:
- `POSTGRES_USER` i `POSTGRES_PASSWORD` – Główne dane logowania do klastra PostgreSQL.
- `JWT_SECRET` – Tajny klucz używany do podpisywania tokenów logowania.
- Hasła dla poszczególnych mikroserwisów (np. `AUTH_DB_PASSWORD`, `ORDERS_DB_PASSWORD`).
- `RABBITMQ_DEFAULT_USER` i `RABBITMQ_DEFAULT_PASS` – Dane uwierzytelniające dla brokera wiadomości.

---

## 💡 Sposób użycia

1. **Rejestracja/Logowanie:** Wejdź na stronę główną i załóż nowe konto.
2. **Katalog:** Przeglądaj dostępne kursy i szkolenia.
3. **Zakup:** Dodaj wybrany kurs do koszyka i złóż zamówienie (obsługiwane asynchronicznie przez *Order Service* i RabbitMQ).
4. **Nauka:** Po zakupie kurs pojawi się w Twoim panelu. Oglądaj materiały wideo i pobieraj dokumenty z *File Storage Service*.

*[Tutaj polecam dodać krótkiego GIF-a lub wideo pokazujące proces składania zamówienia - np. `![Zakup Kursu](docs/checkout-demo.gif)`]*

---

## 🤝 Autorzy

Projekt realizowany w ramach przedmiotu **Tworzenie Aplikacji Bazodanowych**, prowadzony przez: **dr inż. Roberta Brzeskiego**.

**Zespół programistów:**
- [Piotr Maj](https://github.com/AliasMaster)
- [Bartosz Jędryka](https://github.com/JedrBart)
- [Aleksandra Kuś](https://github.com/AleksandraKus11)
- [Wojciech Pędziwiatr](https://github.com/Wojtek4321)
- [Adrian Suchenia](https://github.com/Suchy777)

---

## 📄 Licencja

Projekt dystrybuowany na licencji **MIT**. Zezwala na użytek edukacyjny, komercyjny oraz wprowadzanie modyfikacji. Wszelkie prawa zastrzeżone dla autorów i uczelni.

---
*Wygenerowane z dbałością o estetykę i dobre praktyki Open Source. 🚀*
