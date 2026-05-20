#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- TYPES
    CREATE TYPE user_role AS ENUM ('admin', 'user', 'company');
    CREATE TYPE thread_category AS ENUM ('general', 'feedback', 'support');
    CREATE TYPE course_status AS ENUM ('active', 'inactive');
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    CREATE TYPE enrollment_status AS ENUM ('active', 'revoked');

    -- SCHEMAS
    CREATE SCHEMA auth;
    CREATE SCHEMA community;
    CREATE SCHEMA catalog;
    CREATE SCHEMA orders;
    CREATE SCHEMA enrollment;

    -- TABLES
    -- AUTH
    CREATE TABLE auth.users (
        id UUID PRIMARY KEY,
        login VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role user_role NOT NULL
    );

    CREATE TABLE auth.refresh_tokens (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        token_hash VARCHAR(512) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- COMMUNITY
    CREATE TABLE community.threads (
        id UUID PRIMARY KEY,
        content VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        author_id UUID NOT NULL REFERENCES auth.users(id),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        category thread_category NOT NULL
    );

    CREATE TABLE community.posts (
        id UUID PRIMARY KEY,
        thread_id UUID NOT NULL REFERENCES community.threads(id),
        content VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        author_id UUID NOT NULL REFERENCES auth.users(id)
    );

    -- CATALOG
    CREATE TABLE catalog.courses (
        id UUID PRIMARY KEY,
        author_id UUID NOT NULL REFERENCES auth.users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        status course_status NOT NULL,
        is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE catalog.course_accesses (
        user_id UUID NOT NULL REFERENCES auth.users(id),
        course_id UUID NOT NULL REFERENCES catalog.courses(id),
        granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, course_id)
    );

    CREATE TABLE catalog.lessons (
        id UUID PRIMARY KEY,
        course_id UUID NOT NULL REFERENCES catalog.courses(id),
        title VARCHAR(255) NOT NULL,
        content_url TEXT,
        order_index INT NOT NULL
    );

    CREATE TABLE catalog.progress (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id),
        lesson_id UUID NOT NULL REFERENCES catalog.lessons(id),
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        last_accessed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE catalog.reviews (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id),
        course_id UUID NOT NULL REFERENCES catalog.courses(id),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- ORDERS
    CREATE TABLE orders.payments (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id),
        course_id UUID NOT NULL REFERENCES catalog.courses(id),
        amount DECIMAL(10, 2) NOT NULL,
        status payment_status NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- ENROLLMENT
    CREATE TABLE enrollment.enrollments (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id),
        course_id UUID NOT NULL REFERENCES catalog.courses(id),
        status enrollment_status NOT NULL DEFAULT 'active',
        enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
    );

    -- INITIAL DATA SEEDING
    INSERT INTO auth.users (id, login, password_hash, role) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin', '\$2a\$11\$uroIZtECDzGg3fe24LCLxebVOZbqvEhP0pd7YFzcs6Ernthc3mIDK', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'company', '\$2a\$11\$6Z501vaz5w57TIOWiBiz6e3LCme/wVPqViAEqE2pdSoBJZvq4G9sC', 'company'),
    ('33333333-3333-3333-3333-333333333333', 'student', '\$2a\$11\$DqyT3NRfWD5XcFVWNm1QzeSB/TAzmGEesBEW.MpP7owVoo2By1ucW', 'user');

    INSERT INTO auth.refresh_tokens (id, user_id, token_hash, expires_at, is_revoked) VALUES
    ('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 'dummy_token_hash_student_1', CURRENT_TIMESTAMP + INTERVAL '7 days', false),
    ('99999999-9999-9999-9999-999999999998', '22222222-2222-2222-2222-222222222222', 'dummy_token_hash_company_1', CURRENT_TIMESTAMP + INTERVAL '7 days', false),
    ('99999999-9999-9999-9999-999999999997', '11111111-1111-1111-1111-111111111111', 'dummy_token_hash_admin_1', CURRENT_TIMESTAMP + INTERVAL '7 days', false);

    INSERT INTO community.threads (id, content, title, author_id, category) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jakie IDE polecacie do C#?', 'Pierwsze kroki', '33333333-3333-3333-3333-333333333333', 'general'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Problem z kompilacją', 'Pomoc z kodem', '33333333-3333-3333-3333-333333333333', 'support'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Prośba o nowy kurs z Pythona', 'Sugestia kursu', '33333333-3333-3333-3333-333333333333', 'feedback');

    INSERT INTO community.posts (id, thread_id, content, author_id) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Zdecydowanie Visual Studio lub Rider!', '22222222-2222-2222-2222-222222222222'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dzięki za polecenie!', '33333333-3333-3333-3333-333333333333'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pokaż logi błędu, spróbujemy pomóc.', '22222222-2222-2222-2222-222222222222');

    INSERT INTO catalog.courses (id, author_id, title, description, price, image_url, status) VALUES 
    ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Podstawy programowania w C#', 'Praktyczny kurs programowania w języku C# od podstaw', 99.00, 'https://picsum.photos/seed/csharp/800/600', 'active'),
    ('44444444-4444-4444-4444-444444444445', '22222222-2222-2222-2222-222222222222', 'Zaawansowany C#', 'Delegaty, eventy, LINQ', 149.00, 'https://picsum.photos/seed/csharp2/800/600', 'active'),
    ('44444444-4444-4444-4444-444444444446', '22222222-2222-2222-2222-222222222222', 'Wzorce Projektowe', 'Wzorce kreacyjne, strukturalne', 199.00, 'https://picsum.photos/seed/patterns/800/600', 'active');

    INSERT INTO catalog.course_accesses (user_id, course_id) VALUES
    ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'),
    ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444445'),
    ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444446');

    INSERT INTO catalog.lessons (id, course_id, title, content_url, order_index) VALUES 
    ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'Wprowadzenie do kursu', 'intro.mp4', 1),
    ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'Instalacja środowiska', 'setup.mp4', 2),
    ('66666666-6666-6666-6666-666666666667', '44444444-4444-4444-4444-444444444445', 'Czym są delegaty?', 'delegates.mp4', 1),
    ('66666666-6666-6666-6666-666666666668', '44444444-4444-4444-4444-444444444446', 'Wzorzec Singleton', 'singleton.mp4', 1);

    INSERT INTO catalog.progress (id, user_id, lesson_id, is_completed) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', true),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', false),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666667', true);

    INSERT INTO catalog.reviews (id, user_id, course_id, rating, comment) VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 5, 'Świetny kurs dla początkujących!'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddd1', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444445', 4, 'Trudny, ale warto'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddd2', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444446', 5, 'Wzorce fajnie wytłumaczone');

    INSERT INTO orders.payments (id, user_id, course_id, amount, status) VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 99.00, 'completed'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444445', 149.00, 'completed'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444446', 199.00, 'completed');

    INSERT INTO enrollment.enrollments (id, user_id, course_id, status) VALUES 
    ('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'active'),
    ('88888888-8888-8888-8888-888888888889', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444445', 'active');

    -- USERS

    CREATE USER auth_user WITH PASSWORD '$AUTH_DB_PASSWORD';
    CREATE USER community_user WITH PASSWORD '$COMMUNITY_DB_PASSWORD';
    CREATE USER catalog_user WITH PASSWORD '$CATALOG_DB_PASSWORD';
    CREATE USER orders_user WITH PASSWORD '$ORDERS_DB_PASSWORD';
    CREATE USER report_user WITH PASSWORD '$REPORT_DB_PASSWORD';
    CREATE USER enrollment_user WITH PASSWORD '$ENROLLMENT_DB_PASSWORD';

    -- USER PERMISSIONS
    GRANT USAGE ON SCHEMA auth TO auth_user, community_user, catalog_user, orders_user, report_user;
    GRANT USAGE ON SCHEMA community TO community_user, report_user;
    GRANT USAGE ON SCHEMA catalog TO catalog_user, orders_user, report_user, enrollment_user;
    GRANT USAGE ON SCHEMA orders TO orders_user, report_user;
    GRANT USAGE ON SCHEMA enrollment TO enrollment_user, report_user, catalog_user;

    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO auth_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA community TO community_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA catalog TO catalog_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA orders TO orders_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA enrollment TO enrollment_user;

    GRANT SELECT ON ALL TABLES IN SCHEMA auth TO community_user, catalog_user, orders_user, report_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA catalog TO orders_user, report_user, enrollment_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA community TO report_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA orders TO report_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA enrollment TO report_user, catalog_user;

    GRANT ALL PRIVILEGES ON TABLE catalog.progress TO enrollment_user;
EOSQL