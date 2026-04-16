#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- USUNIĘTO SEKCJE TYPES (ENUMY)

    -- SCHEMAS
    CREATE SCHEMA auth;
    CREATE SCHEMA community;
    CREATE SCHEMA catalog;
    CREATE SCHEMA orders;

    -- TABLES
    -- AUTH
    CREATE TABLE auth.users (
        id UUID PRIMARY KEY,
        login VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) UNIQUE,          
        profile_pic TEXT,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'User', 'Company'))
    );

    -- COMMUNITY
    CREATE TABLE community.threads (
        id UUID PRIMARY KEY,
        content VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        author_id UUID NOT NULL REFERENCES auth.users(id),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        category VARCHAR(50) NOT NULL CHECK (category IN ('General', 'Feedback', 'Support'))
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
        status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Inactive'))
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
        status VARCHAR(50) NOT NULL CHECK (status IN ('Pending', 'Completed', 'Failed')),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- USERS
    CREATE USER auth_user WITH PASSWORD '$AUTH_DB_PASSWORD';
    CREATE USER community_user WITH PASSWORD '$COMMUNITY_DB_PASSWORD';
    CREATE USER catalog_user WITH PASSWORD '$CATALOG_DB_PASSWORD';
    CREATE USER orders_user WITH PASSWORD '$ORDERS_DB_PASSWORD';
    CREATE USER report_user WITH PASSWORD '$REPORT_DB_PASSWORD';

    -- USER PERMISSIONS
    GRANT USAGE ON SCHEMA auth TO auth_user, community_user, catalog_user, orders_user, report_user;
    GRANT USAGE ON SCHEMA community TO community_user, report_user;
    GRANT USAGE ON SCHEMA catalog TO catalog_user, orders_user, report_user;
    GRANT USAGE ON SCHEMA orders TO orders_user, report_user;

    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO auth_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA community TO community_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA catalog TO catalog_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA orders TO orders_user;

    GRANT SELECT ON ALL TABLES IN SCHEMA auth TO community_user, catalog_user, orders_user, report_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA catalog TO orders_user, report_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA community, orders TO report_user;
EOSQL